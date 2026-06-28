const { spawn } = require('child_process');
const percentage = 100;
const normalized = 1.0;
const cmd = `Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
[Guid("5CDF2C82-841E-4546-9722-0CF74078229A"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface IAudioEndpointVolume {
  int NotImpl1(); int NotImpl2(); int NotImpl3(); int NotImpl4();
  int SetMasterVolumeLevelScalar(float fLevel, System.Guid pguidEventContext);
  int GetMasterVolumeLevelScalar(out float pfLevel);
}
[Guid("D666063F-1587-4E43-81F1-B948E807363F"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface IMMDevice { int Activate(ref Guid iid, int dwClsCtx, IntPtr pActivationParams, [MarshalAs(UnmanagedType.IUnknown)] out object ppInterface); }
[Guid("A95664D2-9614-4F35-A746-DE8DB63617E6"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface IMMDeviceEnumerator { int GetDefaultAudioEndpoint(int dataFlow, int role, out IMMDevice ppDevice); }
[ComImport, Guid("BCDE0395-E52F-467C-8E3D-C4579291692E")] class MMDeviceEnumerator {}
public class Audio {
  public static void SetVolume(float level) {
    var enumerator = new MMDeviceEnumerator() as IMMDeviceEnumerator;
    IMMDevice dev; enumerator.GetDefaultAudioEndpoint(0, 1, out dev);
    var iid = typeof(IAudioEndpointVolume).GUID;
    object o; dev.Activate(ref iid, 23, IntPtr.Zero, out o);
    var vol = (IAudioEndpointVolume)o;
    vol.SetMasterVolumeLevelScalar(level, Guid.Empty);
  }
}
'@
[Audio]::SetVolume(${normalized})
Write-Output 'Volume set to ${percentage}%'`;

const buffer = Buffer.from(cmd, 'utf16le');
const base64 = buffer.toString('base64');
const ps = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', base64]);
ps.stdout.on('data', d => console.log('OUT:', d.toString()));
ps.stderr.on('data', d => console.log('ERR:', d.toString()));
ps.on('close', c => console.log('DONE:', c));
