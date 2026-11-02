# 插件开发

以下管理和 SDK 从 1.22.0 起提供，1.21.0 不含这些管理功能和 SDK。插件采用 **Microsoft.Extensions.DependencyInjection + 独立 AssemblyLoadContext**；外部程序使用的 HTTP 接口另见 [IPC 接口文档](/reference/ipc.html)。

## 版本与边界

目标框架为 .NET 10，契约程序集为 `ClassShout.Plugin.Abstractions`，插件 API 版本为 1。教师桌面端与教室端都支持托管 DLL 插件；Android 暂不加载插件。ClassIsland 风格指管理体验，`.cspx` 不是 ClassIsland `.cipx`，两者二进制接口不兼容。

新插件不启动本地 HTTP 服务，不需要 IPC 令牌，不通过 JSONL 调用宿主。一个插件拥有自己的加载上下文、DI 容器和作用域；SDK 契约及 DI 抽象与宿主共享，其他私有依赖随包加载。

## 管理与插件包

1.23.0 新增独立设置页：教室端在「设置 → 插件」标签管理；教师端从「设备 → 管理插件」进入并可返回。页面沿用同一管理器实例；页面切换不触发插件重启，教室端 PIN 权限继续有效。

在「插件管理」中查看已安装列表、搜索名称 / 作者 / 标识、查看详情、从文件安装、启用、禁用、重启或卸载。安装前展示清单及权限说明，确认安装后默认禁用；启用才加载程序集。当前提供本地 `.cspx` / `.zip` 文件安装，不包含在线市场。

`.cspx` 是 ZIP，根目录必须有 `manifest.json`、入口 DLL、对应 `.deps.json` 及私有依赖；不要再套一层项目目录。升级使用相同 Id 和更高 Version，新版本保持禁用。卸载先停止插件及释放作用域，再删除安装文件；独立 `plugin-data` 目录保留。

包压缩大小最多 32 MiB，解压总量最多 64 MiB，单文件最多 32 MiB，最多 256 项。拒绝路径越界、盘符、设备名、链接、大小写重复路径及过深目录；安装阶段不会执行插件代码。每端最多登记 64 个插件。

## 清单格式

```json
{
  "ApiVersion": 1,
  "Id": "classshout.hello",
  "Name": "问候示例",
  "Version": "1.0.0",
  "Author": "ClassShout",
  "Description": "启用后向当前教室发送一条纯展示消息，并查询上屏回执后退出。",
  "EntryPoint": "ClassShout.Examples.HelloPlugin.dll",
  "EntryType": "ClassShout.Examples.HelloPlugin.PluginModule",
  "Runner": "assembly",
  "Arguments": [],
  "Hosts": ["teacher", "classroom"],
  "Platforms": ["windows", "linux"]
}
```

`Id` 为 1–64 个 ASCII 字母、数字、点、横线或下划线，不能使用设备名或以点结尾。`Name` 最多 128 字、`Author` 最多 128 字、`Description` 最多 2048 字。`Version` 使用 .NET Version 可解析的数字版本；`ApiVersion` 当前只能为 1。

`EntryPoint` 为包内相对 DLL 路径，`EntryType` 为公开模块类型全名。`Runner` 为 assembly，兼容字段 Arguments 必须为空。`Hosts` 为 teacher / classroom，`Platforms` 为 windows / linux / macos；安装时会核对当前端和平台。macOS 仍属实验平台，不代表已经完成运行验证。

## 依赖注入入口

模块实现 `IPluginModule`，提供公开无参构造函数，在 `ConfigureServices(IServiceCollection)` 中注册自身服务和一个 `IClassShoutPlugin`。真正执行生命周期的插件由 DI 构造，支持构造函数注入；Scoped、Singleton 服务都属于本插件容器，不与其他插件共享。

宿主预注册 `IPluginContext`、`IPluginLog`、`IPluginShoutService`，模块不得替换这些注册。容器启用 ValidateScopes / ValidateOnBuild；不要把 Scoped 服务注入 Singleton。下面是仓库中实际编译验收的示例：

```csharp
using ClassShout.Plugin.Abstractions;
using Microsoft.Extensions.DependencyInjection;

namespace ClassShout.Examples.HelloPlugin;

public sealed class PluginModule : IPluginModule
{
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddScoped<GreetingService>();
        services.AddScoped<IClassShoutPlugin, HelloPlugin>();
    }
}

public sealed class GreetingService(IPluginShoutService shouts, IPluginLog log)
{
    public async Task SendAsync(CancellationToken token)
    {
        var result = await shouts.SendAsync(Guid.NewGuid().ToString("N"), "ClassShout 示例插件已启动。", false, token);
        log.Information(result.Accepted ? "示例消息已提交，请通过回执确认执行。" : "示例消息未提交，请检查教室连接。");
    }
}

public sealed class HelloPlugin(GreetingService greeting) : IClassShoutPlugin
{
    public async ValueTask StartAsync(CancellationToken cancellationToken) => await greeting.SendAsync(cancellationToken);
    public ValueTask StopAsync(CancellationToken cancellationToken) => ValueTask.CompletedTask;
}
```

引用 SDK 项目时不要把另一份契约 DLL 打进包，否则容易产生类型身份问题；宿主会优先共享自己的契约程序集。仓库示例使用：

```xml
<ProjectReference Include="../../../src/ClassShout.Plugin.Abstractions/ClassShout.Plugin.Abstractions.csproj"
                  Private="false" ExcludeAssets="runtime" />
```

## 生命周期与程序集隔离

启动依次为：建立独立可回收加载上下文 → 加载模块 → 注册服务 → 建立独立服务提供器和异步作用域 → DI 构造插件 → 调用 StartAsync。禁用、重启和卸载会取消生命周期 token，调用 StopAsync，再释放作用域和容器，最后请求卸载加载上下文。

启动等待上限 10 秒，停止钩子建议在 5 秒内响应。插件需主动停止自己的后台任务、取消计时器并解除订阅；未响应取消或停止超时会显示「需重启应用以释放程序集」，不会假装已经卸载。不要用同步等待阻塞宿主服务调用。

程序集隔离用于依赖版本及类型隔离，**不是安全沙箱，也不是原生崩溃隔离**。插件仍具有当前用户权限；静态引用、遗留线程或原生依赖可阻止回收，必要时重启。机制参考 [Microsoft 插件加载说明](https://learn.microsoft.com/en-us/dotnet/core/tutorials/creating-app-with-plugin-support)及[卸载说明](https://learn.microsoft.com/en-us/dotnet/standard/assembly/unloadability)。

## 宿主服务接口

| 注入服务 | 接口 |
|---|---|
| `IPluginContext` | Id、Role、DataDirectory；不包含登录、IPC 或中继凭据 |
| `IPluginLog` | Information(string)，请使用中文日志，不记录密钥 |
| `IPluginShoutService` | GetStatusAsync、SendAsync、GetReceiptAsync；全部支持 CancellationToken |

`SendAsync(id, text, speak, token)` 返回 Accepted、Duplicate、Error。消息 Id 最多 80 字符，正文最多 10000 字符，均不可为空白。相同插件的相同 Id 和内容会去重，不同内容冲突；教师端发送至当前连接教室，未连接会拒绝，教室端直接执行本地消息。插件 API 不提供全局停止其他消息的能力。

`GetReceiptAsync(id, token)` 返回 Id、Stage、Failure、Timeline，找不到或教师端历史淘汰时返回 null。阶段为 sent / delivered / displayed / completed / failed；纯展示等到 displayed，朗读等到 completed，失败读取 Failure。取消等待不代表消息绝对未执行，不要直接换新 Id 重发。

去重按插件 Id 隔离，每端所有扩展共享当前进程 1000 条额度。重启后不保留；教师端回执还受最近 100 条投递列表限制。DataDirectory 位于配置目录的 `plugin-data/端/插件Id`，独立于安装目录，适合保存插件自己的配置。

## 打包与验证

在主仓库运行以下命令，产出的包可在插件管理中选择安装。示例启用会向测试教室发送一条真实消息；教师端请先连接测试教室。重复打包请更换输出名，脚本不会覆盖已有包。

```powershell
dotnet publish examples/plugins/HelloPlugin/HelloPlugin.csproj -c Release -o artifacts/plugin-example
pwsh -File scripts/pack-plugin.ps1 -Source artifacts/plugin-example -Output artifacts/classshout.hello.cspx
```

验收命令：`dotnet run --project tools/ClassShout.EndToEnd -c Release -- --plugin-management`，另有 `scripts/regress.ps1` 完整回归。覆盖同名不同版本私有依赖、构造函数注入、作用域释放、加载上下文实际回收、安装回滚及管理界面交互。

## 配置分离与旧版迁移

IPC 使用 `classroom-ipc.json` / `teacher-ipc.json`；插件注册使用 `classroom-plugins.json` / `teacher-plugins.json`，安装目录为 `plugins/端/插件Id`。修改 IPC 不重启插件，管理插件不修改 IPC 令牌或监听。

从 1.21.0 升级时保留原 IPC 令牌和开关，将已授权旧进程注册迁入插件列表，标为「旧版进程兼容注册」。旧文件 extensions.json / teacher-extensions.json 保留备查，新文件存在后不再反向覆盖。旧进程兼容不是新 DLL SDK 的实现方式；新开发请使用上述 DI 契约。旧进程卸载仅删除注册，不删除外部程序。
