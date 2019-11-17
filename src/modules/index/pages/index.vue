<template>
  <el-button type="primary" @click="handleClick">进入home页面</el-button>
</template>
<script>
  export default {
    data() {
      return {

      }
    },
    mounted() {
      console.log(2)
    },
    methods: {
      handleClick() {
        this.$router.push('/home');
      }
    }
  }
</script>
<style rel="stylesheet/less" lang="less">
</style>
