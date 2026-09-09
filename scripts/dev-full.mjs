import { spawn } from 'node:child_process'

const windows = process.platform === 'win32'
const npm = windows ? 'npm.cmd' : 'npm'
const children = []

function start(script) {
  const command = windows ? (process.env.ComSpec || 'cmd.exe') : npm
  const args = windows ? ['/d', '/s', '/c', `${npm} run ${script}`] : ['run', script]
  const child = spawn(command, args, {
    stdio: 'inherit',
    env: process.env,
    shell: false,
  })
  children.push(child)
  child.on('exit', (code, signal) => {
    if (code && code !== 0) process.exitCode = code
    if (signal) process.exitCode = 1
  })
  return child
}

start('api')
start('dev')

function shutdown() {
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM')
  }
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
process.on('exit', shutdown)
