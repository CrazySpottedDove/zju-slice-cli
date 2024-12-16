#!/bin/bash

show_help() {
    echo "Usage: zcourse.sh [OPTION]"
    echo "Options:"
    echo "  --help | -h           显示帮助信息"
    echo "  --upgrade | -up       获取课程信息并写入 .course_cache（config的先决条件，建议每学期运行一次）"
    echo "  --fetch | -f         根据 courseConfig.json 登录并拉取对应资源。通常作为最后一步。在使用 --config 后就可以只使用这个命令拉取资源。"
    echo "  --course-config | -c 调用 configCourse.js 来选择你需要的课程"
    echo "  --init | -i          初始化用户信息"
    echo "  --clean-cache | -clean   清理缓存"
    echo "  --locate | -l        修改保存路径"
    echo "  --user-config | -u    配置用户默认项，如保存时是否区分课件与作业"
}

upgrade_courses() {
    echo "更新课程信息..."
    node "$(dirname "$(readlink -f "$0")")/upgrade.js"
}

fetch_resources() {
    echo "拉取课程资源..."
    # node "$(dirname "$(readlink -f "$0")")/fetch.js"
    local userConfigFile
    userConfigFile="$(dirname "$(readlink -f "$0")")/.course_cache/userConfig.json"
    local background
    background=$(jq -r '.background' "$userConfigFile")

    if [ "$background" = "true" ]; then
        node "$(dirname "$(readlink -f "$0")")/fetch.js" > /dev/null 2>&1 &
        echo "fetch.js 已在后台运行"
    else
        node "$(dirname "$(readlink -f "$0")")/fetch.js"
    fi
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
    --help|-h)
        show_help
        ;;
    --upgrade|-up)
        upgrade_courses
        ;;
    --fetch|-f)
        fetch_resources
        ;;
    --course-config|-c)
        config_course
        ;;
    --init|-i)
        init
        ;;
    --clean-cache|-clean)
        clean_cache
        ;;
    --locate|-l)
        locate
        ;;
    --user-config|-u)
        config_user
        ;;
    *)
        echo "Invalid option: $1"
        show_help
        exit 1
        ;;
esac
exit 0