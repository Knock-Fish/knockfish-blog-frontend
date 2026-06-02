<template>
    <ElCard>
        <div class="avatar">
            <ElAvatar :size="100" :src="user.avatar" />
            <div class="name">{{user.nickname}}</div>
            <div class="introduction">{{user.description}}</div>
        </div>
    </ElCard>
</template>

<script setup lang='ts'>
import { UserService } from "@api/userApi"
type User = Api.User.UserInfo
const user = ref<User>({
    avatar: "", 
    nickname: "", 
    description: ""
})
UserService.getUserInfo({username: "knockfish"}).then((data) => {
    user.value = data
})
</script>

<style lang="scss" scoped>
.el-card {
    background-color: var(--bg-color-100);

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