<template>
  <el-row>
    <el-col :span="8" class="text-right">
      <span>{{ spanText }}<span v-if="spanRed" style="color: red">*</span> :&nbsp;</span>
    </el-col>
    <el-col :span="16" style="position: relative">
      <el-input size="mini" style="position: absolute" clearable v-model="childVal" :disabled="true"  class="padding-right"></el-input>
      <el-button size="mini" style="position: absolute;right: 0" icon="el-icon-search" :disabled="!add || disabled" @click="dialogVisible(row)"></el-button>
      <i @click="inputChange('')" class="el-icon-close btn-i" title="清除"></i>
    </el-col>
  </el-row>
</template>
<script>
const boolDefault = { type: Boolean, default: true };
const strDefault = { type: String, default: ''};
export default {
  props: {
    spanText: strDefault,
    childVal: strDefault,
    width: {
      type: String,
      default: '173px'
    },
    spanRed: boolDefault,
    add: boolDefault,
    dialogVisible: {
      type: Function,
      default: () => {}
    },
    row: { type: Object, default: () => {} },
    disabled: { type: Boolean, default: false  }
  },
  data() {
    return {
      childValC: this.childVal,
      display: 'none'
    }
  },
  methods: {
    inputChange(val) {
      this.$emit('update:childVal', val);
    },
  }
}
</script>
<style rel="stylesheet/less" lang="less">
.padding-right{
  width: 214px!important;
}
.btn-i{
  position: absolute;
  right: 50px;
  top: 6px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 7px;
  cursor: pointer;
}
.btn-i:hover {
    color: #409EFF;
    border-color: #c6e2ff;
    background-color: #ecf5ff;
}
</style>
