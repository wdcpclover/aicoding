import fs from 'fs'
import path from 'path'
import { ExampleData } from './utils'

export declare const data: Record<string, ExampleData>

export { ExampleData }

export default {
  watch: 'src/**',
  load() {
    const srcDir = path.resolve(__dirname, './src')
    return readExamples(srcDir)
  }
}

export function readExamples(srcDir: string): Record<string, ExampleData> {
  const examples = fs.readdirSync(srcDir)
  const data: Record<string, ExampleData> = {}
  for (const name of examples) {
    const fullPath = path.join(srcDir, name)
    // 跳过 .DS_Store 等系统文件
    if (!fs.statSync(fullPath).isDirectory()) continue
    data[name] = readExample(fullPath)
  }
  return data
}

function readExample(dir: string): ExampleData {
  const filenames = fs.readdirSync(dir)
  const files: ExampleData = {}
  for (const filename of filenames) {
    const fullPath = path.join(dir, filename)
    if (fs.statSync(fullPath).isDirectory()) {
      files[filename] = readComponentDir(fullPath)
    } else {
      files[filename] = fs.readFileSync(fullPath, 'utf-8')
    }
  }

  return files
}

function readComponentDir(dir: string): Record<string, string> {
  const filenames = fs.readdirSync(dir)
  const files: Record<string, string> = {}
  for (const filename of filenames) {
    let content = fs.readFileSync(path.join(dir, filename), 'utf-8')
    if (!content.endsWith('\n')) content += '\n'
    files[filename] = content
  }
  return files
}
