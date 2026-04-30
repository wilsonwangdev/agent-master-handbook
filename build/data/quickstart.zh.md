按照 AI Native 最佳实践，为当前项目搭建 agent-ready harness 环境。

## 具体步骤

1. 在项目根目录创建 AGENTS.md 作为规范的 agent 入口文件，包含：
   - 项目目的（一段话）
   - 目录结构及每个文件夹的内容
   - 构建、测试和运行命令
   - 提交约定（原子提交，使用 feat:、fix:、build: 等前缀）
   - 指向 specs、rules、skills 等上下文文件的指针

2. 创建符号链接，使所有主流 agent 工具都能找到同一文件：
   - ln -s AGENTS.md CLAUDE.md
   - ln -s AGENTS.md .cursorrules
   - ln -s AGENTS.md .windsurfrules

3. 创建 .claude/settings.json，配置常见操作（构建、测试、git 只读命令）的权限白名单。

4. 创建 journal/ 目录，附带 README 说明其用于记录 agent 故障以实现跨会话自我进化。

5. 创建 specs/ 目录，用于 SPEC 驱动的决策记录。

6. 创建 skills/ 目录，附带 README 定义添加 skill 的质量门禁。

## 原则

- AGENTS.md 控制在 200 行以内——每一行都在争夺上下文窗口空间
- 使用 AGENTS.md（而非 CLAUDE.md）作为规范文件名——它对 agent 工具是中立的
- 空结构优于低质量占位内容
- 编写自定义 skill 前先检查社区是否已有（skills.sh、cursor.directory）
- 参考 {{siteUrl}} 获取每项实践的详细指南