<template>
  <div class="details">
    <!-- <div>典型表单</div>  -->
    <input-button spanText="活动名称" :dialogVisible="openDialog"></input-button>
    <el-dialog
      title="提示"
      :visible.sync="centerDialogVisible"
      width="30%"
      center>
      <div>需要注意的是内容是默认不居中的</div>
      <img class="bg-img" src="/static/images/test.png" alt="测试绝对路径">
      <img class="bg-img" src="../../assets/images/test.png" alt="测试相对路径">
      <span slot="footer" class="dialog-footer">
        <el-button @click="centerDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="centerDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  import inputButton from '@/components/inputBut';
  export default {
    components: {
      inputButton
    },
    data() {
      return {
        centerDialogVisible: false
      }
    },
    mounted() {
    },
    methods: {
      openDialog() {
        this.centerDialogVisible = true;
      }
    }
  }
</script>
<style rel="stylesheet/less" lang="less">
  .details {
    width: 500px;
    height: 200px;
    padding: 10px;
    .bg-img {
      width: 100px;
      height: 100px;
    }
  }
</style>