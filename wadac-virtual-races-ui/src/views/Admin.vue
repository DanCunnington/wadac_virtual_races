<template>
  <div class="admin-page">
    <AdminMain/>
  </div>
</template>

<script>
// @ is an alias to /src
import AdminMain from '@/components/admin/AdminMain.vue'

export default {
  name: 'Admin',
  components: {
    AdminMain
  }
}
</script>
