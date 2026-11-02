# Plugin development

The management UI and SDK below are available from 1.22.0 and are not part of the published 1.21.0 build. Plugins use **Microsoft.Extensions.DependencyInjection and an independent AssemblyLoadContext**. External HTTP integrations have separate [IPC API documentation](/en/reference/ipc.html).

## Version and scope

Target .NET 10 and reference `ClassShout.Plugin.Abstractions`; the plugin API version is 1. Desktop teacher and classroom hosts support managed DLL plugins; Android does not load them. ClassIsland-style describes management, not binary compatibility: `.cspx` packages are not ClassIsland `.cipx` packages.

New plugins do not start an HTTP server, need an IPC token or use JSONL to call the host. Each owns its load context, DI container and scope. SDK contracts and DI abstractions are shared with the host; private dependencies load from the plugin package.

## Management and packages

Version 1.23.0 adds dedicated settings pages: Settings → Plugins in the classroom app and Devices → Manage plugins in the teacher app, with return navigation. The same manager instance remains active across navigation, and classroom PIN protection still applies.

Plugin management provides an installed list, search by name/author/ID, details, local installation, enable, disable, restart and uninstall. Review the manifest and permissions before confirming installation. Packages are disabled initially and assemblies load only on enable. This version supports local `.cspx` / `.zip` files, without an online marketplace.

A `.cspx` is a ZIP with manifest.json, entry DLL, its .deps.json and private dependencies at the package root, without an extra project directory. Upgrade keeps the ID and increases Version; the new version stays disabled. Uninstall stops the plugin and releases its scope before removing installed files. The separate plugin-data directory is retained.

Compressed packages are limited to 32 MiB, total extracted data to 64 MiB, individual files to 32 MiB and entries to 256. Traversal, drive/device names, links, case-conflicting paths and excessive nesting are rejected. Installation does not execute code. Each host supports at most 64 registrations.

## Manifest format

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

`Id` contains 1–64 ASCII letters, digits, dots, hyphens or underscores; device names and trailing dots are forbidden. Name and Author are limited to 128 characters each, Description to 2048. Version must be a numeric .NET Version; ApiVersion currently must be 1.

EntryPoint is a package-relative DLL path; EntryType is the public module's full type name. Runner is assembly; the compatibility Arguments field must be empty. Hosts contains teacher/classroom; Platforms contains windows/linux/macos. Installation checks the current host and platform. macOS remains experimental rather than runtime-validated.

## Dependency injection entry point

The module implements IPluginModule with a public parameterless constructor. ConfigureServices(IServiceCollection) registers its services and one IClassShoutPlugin. DI constructs the lifecycle implementation and resolves constructor dependencies. Both Scoped and Singleton services belong to this plugin's container and are not shared with other plugins.

The host registers IPluginContext, IPluginLog and IPluginShoutService; modules may not replace them. ValidateScopes and ValidateOnBuild are enabled; do not inject scoped dependencies into singletons. This example is compiled and exercised from the repository:

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

Do not package another contract DLL when referencing the SDK project; duplicate type identities are avoided by sharing the host contract. The repository example uses:

```xml
<ProjectReference Include="../../../src/ClassShout.Plugin.Abstractions/ClassShout.Plugin.Abstractions.csproj"
                  Private="false" ExcludeAssets="runtime" />
```

## Lifecycle and assembly isolation

Startup creates a collectible load context, loads the module, registers services, builds a dedicated provider and async scope, constructs the plugin through DI, and calls StartAsync. Disable, restart and uninstall cancel the lifetime token, call StopAsync, dispose the scope/provider, then request context unloading.

Startup has a ten-second wait limit; stopping should respond within five seconds. Stop background work, cancel timers and unsubscribe events. Cancellation or shutdown timeouts display a restart-required state instead of claiming complete unloading. Do not synchronously block while calling host services.

Assembly isolation separates dependency versions and types; it is **not a security sandbox or native-crash boundary**. Plugins retain the current user's permissions. Static references, remaining threads or native dependencies can prevent collection and require restart. See Microsoft's [plugin loading guide](https://learn.microsoft.com/en-us/dotnet/core/tutorials/creating-app-with-plugin-support) and [unloading guide](https://learn.microsoft.com/en-us/dotnet/standard/assembly/unloadability).

## Host service contracts

| Injected service | API |
|---|---|
| IPluginContext | Id, Role, DataDirectory; no login, IPC or relay credentials |
| IPluginLog | Information(string); use Chinese logs and never log credentials |
| IPluginShoutService | GetStatusAsync, SendAsync, GetReceiptAsync; all accept CancellationToken |

SendAsync(id, text, speak, token) returns Accepted, Duplicate and Error. IDs are limited to 80 characters and text to 10000; neither may be whitespace-only. The same plugin ID/content is deduplicated; conflicting content is rejected. Teachers send to the currently connected classroom and reject disconnected sends; classroom hosts execute locally. Plugins cannot globally stop other messages.

GetReceiptAsync(id, token) returns Id, Stage, Failure and Timeline, or null when missing/evicted. Stages are sent/delivered/displayed/completed/failed. Display-only completion is displayed; speech completion is completed; inspect Failure on failure. Cancelling a wait does not prove non-execution, so do not blindly resend with a new ID.

Deduplication is scoped by plugin ID, with a host-wide limit of 1000 extension messages per process. Restart clears it. Teacher receipts also depend on the latest 100 deliveries. DataDirectory is configuration-root/plugin-data/role/plugin-id, separate from installation files, for plugin-owned settings.

## Packaging and verification

Run these commands in the main repository, then install the resulting package in Plugin management. Enabling this example sends a real message: connect teachers to a test classroom first. Use another output filename for repeated packaging; existing packages are not overwritten.

```powershell
dotnet publish examples/plugins/HelloPlugin/HelloPlugin.csproj -c Release -o artifacts/plugin-example
pwsh -File scripts/pack-plugin.ps1 -Source artifacts/plugin-example -Output artifacts/classshout.hello.cspx
```

Run `dotnet run --project tools/ClassShout.EndToEnd -c Release -- --plugin-management` or scripts/regress.ps1 for the full suite. Coverage includes private dependency version conflicts, constructor injection, scope disposal, actual load-context collection, rollback and management UI interactions.

## Separate configuration and migration

IPC uses classroom-ipc.json/teacher-ipc.json. Registration uses classroom-plugins.json/teacher-plugins.json; installation is under plugins/role/plugin-id. Applying IPC settings does not restart plugins; plugin operations do not change IPC credentials/listeners.

Migration preserves 1.21.0 IPC credentials and switches and imports authorized process registrations as legacy compatibility entries. Original extensions.json/teacher-extensions.json files remain for recovery and no longer overwrite existing new files. Legacy process compatibility is not the new DLL SDK; use the DI contracts for new development. Removing a legacy entry never deletes its external executable.
