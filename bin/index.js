#!/usr/bin/env node

const inquirer = require("inquirer");
const { program } = require("commander");
const figlet = require("figlet");
const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const gitClone = require("git-clone");
const ora = require("ora");

const projectList = {
  "vue3&tdesign": "git@github.com:foxery/template-vue3-ts-tdesign.git",
  "react&umi": "git@github.com:foxery/template-react-umi.git",
  "vue3&uniapp": "git@github.com:foxery/template-vue3-uniapp.git",
};

program.usage("<command> [options");
program.version(`v${require("../package.json").version}`);
program.on("--help", function () {
  console.log(
    figlet.textSync("foxery-cli", {
      font: "Ghost",
      horizontalLayout: "default",
      verticalLayout: "default",
      width: 100,
      whitespaceBreak: true,
    })
  );
});

program
  .command("create <app-name>")
  .description("创建新项目")
  .option("-f", "--force", "如果创建的目录存在则强制删除")
  .action(async function (name, option) {
    const cwd = process.cwd();
    const targetPath = path.join(cwd, name);
    if (fs.existsSync(targetPath)) {
      if (option.force) {
        fs.remove(targetPath);
      } else {
        const res = await inquirer.prompt([
          {
            name: "action",
            type: "list",
            message: "是否覆盖已有文件夹?",
            choices: [
              { name: "YES", value: true },
              { name: "NO", value: false },
            ],
          },
        ]);
        if (!res.action) {
          return;
        } else {
          fs.remove(targetPath);
          console.log(chalk.red("已删除之前的文件夹"));
        }
      }
    }
    const res = await inquirer.prompt([
      {
        name: "type",
        type: "list",
        message: "请选择使用的框架",
        choices: [
          {
            name: "Vue3",
            value: "vue3&tdesign",
          },
          {
            name: "React",
            value: "react&umi",
          },
          {
            name: "Vue3小程序",
            value: "vue3&uniapp",
          },
        ],
      },
    ]);

    const rep = res.type;
    const spinner = ora("正在加载项目模板...").start();
    gitClone(
      projectList[rep],
      targetPath,
      {
        checkout: "main",
      },
      (err) => {
        if (!err) {
          fs.remove(path.resolve(targetPath, ".git"));
          spinner.succeed("项目模板加载完成！");
          console.log("now run:");
          console.log(chalk.green(`\n  cd ${name}`));
          console.log(chalk.green("  npm install"));
          console.log(
            chalk.green(
              `  npm run ${
                res.type.indexOf("react") !== -1 ? "start" : "dev"
              }\n`
            )
          );
        } else {
          spinner.fail(chalk.red("项目模板加载失败，请重新获取！"));
        }
      }
    );
  });

program.parse(process.argv);
