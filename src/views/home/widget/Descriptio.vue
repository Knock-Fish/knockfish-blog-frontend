<template>
    <ElCard>
        <div class="avatar">
            <el-avatar :size="120" :src="user.avatar" />
            <div class="name">{{user.nickName}}</div>
            <div class="introduction">{{user.description}}</div>
        </div>
    </ElCard>
</template>

<script setup lang='ts'>
// const url = ref(new URL("@imgs/avatar.jpg", import.meta.url).href)
import { UserService } from "@api/userApi"
type User = Api.User.UserInfo
const user = ref<User>({
    username: "",
    avatar: "", 
    nickName: "", 
    description: ""
})
UserService.getUserInfo().then((data) => {
    user.value = data
})
</script>

<style lang="scss" scoped>
.el-card {
    @include frosted-glass;

    .avatar {
        text-align: center;

        .name {
            font-family: "logo-font";
            font-weight: bold;
            margin: 15px 0;
        }
    }
}
</style>