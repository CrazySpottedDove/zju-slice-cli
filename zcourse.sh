#!/bin/bash

show_help() {
    echo "Usage: zcourse.sh [OPTION]"
    echo "Options:"
    echo "  --help           显示帮助信息"
    echo "  --upgrade        获取课程信息并写入 .course_cache（config的先决条件，建议每学期运行一次）"
    echo "  --fetch          根据 courseConfig.json 登录并拉取对应资源。通常作为最后一步。在使用 --config 后就可以只使用这个命令拉取资源。"
    echo "  --course-config  调用 configCourse.js 来选择你需要的课程"
    echo "  --init           初始化用户信息"
    echo "  --clean-cache    清理缓存"
    echo "  --locate         修改保存路径"
    echo "  --user-config    配置用户默认项"
}

upgrade_courses() {
    echo "更新课程信息..."
    node "$(dirname "$(readlink -f "$0")")/upgrade.js"
}

fetch_resources() {
    echo "拉取课程资源..."
    node "$(dirname "$(readlink -f "$0")")/fetch.js"
}

config_course() {
    echo "选择需要获取的课程..."
    node "$(dirname "$(readlink -f "$0")")/configCourse.js"
}

config_user(){
    echo "配置用户默认项..."
    node "$(dirname "$(readlink -f "$0")")/configUser.js"
}

init(){
    echo "获取用户信息..."
    node "$(dirname "$(readlink -f "$0")")/initUser.js"
    upgrade_courses
    config_course
    config_user
}

clean_cache(){
    rm -f "$(dirname "$(readlink -f "$0")")/.course_cache/linkCache.json"
    rm -f "$(dirname "$(readlink -f "$0")")/.course_cache/titleCache.json"
}

locate(){
    echo "修改保存路径..."
    node "$(dirname "$(readlink -f "$0")")/locate.js"
}

if [ $# -eq 0 ]; then
    show_help
    exit 1
fi

case "$1" in
    --help)
        show_help
        ;;
    --upgrade)
        upgrade_courses
        ;;
    --fetch)
        fetch_resources
        ;;
    --course-config)
        config_course
        ;;
    --init)
        init
        ;;
    --clean-cache)
        clean_cache
        ;;
    --locate)
        locate
        ;;
    --user-config)
        config_user
        ;;
    *)
        echo "Invalid option: $1"
        show_help
        exit 1
        ;;
esac