# zju-slice-cli

这是一个用于抓取雪灾浙大课件和作业的命令行工具。

仅学习用途，勿用于攻击服务器。

## install

* linux

```bash
# path=whatever path you'd like to install it
cd path
git clone https://github.com/CrazySpottedDove/zju-slice-cli.git
cd zju-slice-cli
npm install
chmod +x ./zcourse.sh
sudo ln -s path/zju-slice-cli/zcourse.sh /usr/local/bin/zcourse
zcourse --help
# show instructions
```

外壳是 shell， windows 的话懒得包装了。默认课件下载目录为 path/zju-slice-cli/courses-fetched

## work

It works belike:

```log
➜  zju-slice-cli git:(master) ✗ zcourse --help
Usage: zcourse.sh [OPTION]
Options:
  --help       显示帮助信息
  --upgrade    获取课程信息并写入 .course_cache（config的先决条件，建议每学期运行一次）
  --fetch      根据 courseConfig.json 登录并拉取对应资源。通常作为最后一步。在使用 --config 后就可以只使用这个命令拉取资源。
  --config     调用 config.js 来选择你需要的课程
 --init       初始化用户信息
➜  zju-slice-cli git:(master) ✗ zcourse --init
获取用户信息...
✔ 请输入用户名: 3230104178
✔ 请输入密码:
用户配置已保存到 /home/dove/zju-slice-cli/.course_cache/userAccount.json
更新课程信息...
Logging in...
Login has succeeded!
GotUrl: https://courses.zju.edu.cn/user/courses#/?pageIndex=1
GotUrl: https://courses.zju.edu.cn/user/courses#/?pageIndex=2
GotUrl: https://courses.zju.edu.cn/user/courses#/?pageIndex=3
GotUrl: https://courses.zju.edu.cn/user/courses#/?pageIndex=3
Upgrade has completed successfully!
选择需要获取的课程...
✔ 请选择一个或多个学期: 2024-2025冬, 2024-2025秋冬, 2023-2024春夏
你选择了学期: 2024-2025冬, 2024-2025秋冬, 2023-2024春夏
✔ 请选择 2024-2025冬 学期需要的课程: 中国共产党历史
你选择了 2024-2025冬 学期的课程: 中国共产党历史
✔ 请选择 2024-2025秋冬 学期需要的课程: 普通物理学Ⅱ（H）, 高级数据结构与算法分析
你选择了 2024-2025秋冬 学期的课程: 普通物理学Ⅱ（H）, 高级数据结构与算法分析
✔ 请选择 2023-2024春夏 学期需要的课程: 数据结构基础
你选择了 2023-2024春夏 学期的课程: 数据结构基础
用户选择已保存到 /home/dove/zju-slice-cli/.course_cache/courseConfig.json
➜  zju-slice-cli git:(master) ✗ zcourse --fetch
拉取课程资源...
Logging in...
Login has succeeded!
Courseware <中国共产党历史>
No more pages.
--> 中国共产党历史 - 课件
Homework <中国共产党历史>
Homework <中国共产党历史> - 书评
Homework page 书评 loaded.
--> 中国共产党历史 - 作业
Courseware <普通物理学Ⅱ（H）>
Navigating to next page...
No more pages.
--> 普通物理学Ⅱ（H） - 课件
Homework <普通物理学Ⅱ（H）>
--> 普通物理学Ⅱ（H） - 作业
Courseware <高级数据结构与算法分析>
Navigating to next page...
No more pages.
--> 高级数据结构与算法分析 - 课件
Homework <高级数据结构与算法分析>
--> 高级数据结构与算法分析 - 作业
Courseware <数据结构基础>
No more pages.
--> 数据结构基础 - 课件
Homework <数据结构基础>
--> 数据结构基础 - 作业
All downloads completed, browser closed.
```
