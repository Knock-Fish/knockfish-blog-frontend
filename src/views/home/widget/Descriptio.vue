<template>
  <div class="poker-card-wrapper">
    <!-- 正面卡片 -->
    <ElCard>
      <UserCardContent :user="user" />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { UserService } from '@api/userApi'
import { useUserStore } from '@/store/modules/user'
import UserCardContent from './UserCardContent.vue'

const userStore = useUserStore()

const { user } = storeToRefs(userStore)

const getUser = async () => {
  const data: Api.User.UserInfo = await UserService.getUserInfo(1)
  userStore.setUser(data)
}

onMounted(async () => {
  await getUser()
})
</script>

<style lang="scss" scoped>

</style>