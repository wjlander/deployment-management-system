
vite v4.5.14 building for production...
✓ 16 modules transformed.
✓ built in 814ms
[vite:esbuild] Transform failed with 1 error:
/home/deployapp/app/src/components/DeploymentManagementSystem.jsx:476:40: ERROR: Expected ")" but found "px"
file: /home/deployapp/app/src/components/DeploymentManagementSystem.jsx:476:40

Expected ")" but found "px"
474|                      <td className="px-4 py-3 text-gray-600">{deployment.area}</td>
475|                      <td className="px-4 py-3">
476|                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
   |                                          ^
477|                          breakTime === 30 ? 'bg-green-100 text-green-800' :
478|                          breakTime === 15 ? 'bg-yellow-100 text-yellow-800' :

error during build:
Error: Transform failed with 1 error:
/home/deployapp/app/src/components/DeploymentManagementSystem.jsx:476:40: ERROR: Expected ")" but found "px"
    at failureErrorWithLog (/home/deployapp/app/node_modules/esbuild/lib/main.js:1649:15)
    at /home/deployapp/app/node_modules/esbuild/lib/main.js:847:29
    at responseCallbacks.<computed> (/home/deployapp/app/node_modules/esbuild/lib/main.js:703:9)
    at handleIncomingPacket (/home/deployapp/app/node_modules/esbuild/lib/main.js:762:9)
    at Socket.readFromStdout (/home/deployapp/app/node_modules/esbuild/lib/main.js:679:7)
    at Socket.emit (node:events:519:28)
    at addChunk (node:internal/streams/readable:561:12)
    at readableAddChunkPushByteMode (node:internal/streams/readable:512:3)
    at Readable.push (node:internal/streams/readable:392:5)
    at Pipe.onStreamRead (node:internal/stream_base_commons:189:23)
