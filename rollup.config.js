import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'

export default {
  // 入口文件
  input: 'packages/vue/src/index.ts',
  // 打包出口
  output: [
    // 导出life模式的包
    {
      // 开启 SourceMap
      sourcemap: true,
      // 导出的文件地址
      file: './packages/vue/dist/vue.js',
      // 导出的包的格式
      format: 'iife',
      // 包的名称
      name: 'Vue'
    }
  ],
  // 插件
  plugins: [
    // ts 插件
    typescript({
      sourceMap: true
    }),
    // 模块导入的路径补全
    resolve(),
    // commonjs 插件
    commonjs()
  ]
}
