<template>
  <div id="login">
    <div class="login-wrap">
      <ul class="menu-tab">
        <li
          :class="{'current':item.current}"
          v-for="item in menuTab"
          :key="item.id"
          @click="toggleMenu(item)"
        >{{item.txt}}</li>
      </ul>
      <el-form
        :model="ruleForm"
        status-icon
        :rules="rules"
        ref="loginForm"
        class="login-form"
        size="medium "
      >
        <el-form-item prop="username" class="item-form">
          <label for="username">邮箱</label>
          <el-input id="username" type="text" v-model="ruleForm.username" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item prop="password" class="item-form">
          <label for="password">密码</label>
          <el-input
            id="password"
            type="password"
            v-model="ruleForm.password"
            autocomplete="off"
            minlength="6"
            maxlength="20"
          ></el-input>
        </el-form-item>

        <el-form-item prop="passwords" class="item-form" v-show="model === 'register'">
          <label>重复密码</label>
          <el-input
            type="password"
            v-model="ruleForm.passwords"
            autocomplete="off"
            minlength="6"
            maxlength="20"
          ></el-input>
        </el-form-item>

        <el-form-item prop="code" class="item-form">
          <label>验证码</label>
          <el-row :gutter="11">
            <el-col :span="15">
              <el-input v-model="ruleForm.code" minlength="6" maxlength="6"></el-input>
            </el-col>
            <el-col :span="8">
              <el-button
                type="success"
                class="block"
                @click="getSms()"
                :disabled="codeButtonStatus.status"
              >{{codeButtonStatus.text}}</el-button>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item>
          <el-button
            type="danger"
            @click="submitForm('loginForm')"
            class="login-btn block"
            :disabled="loginButtonStatus"
          >{{model==='login'?"登录":"注册"}}</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import sha1 from "js-sha1";
import { GetSms, Register, Login } from "@/api/login";
import {
  stripscript,
  validatePass,
  validateEmail,
  validateVCode
} from "@/utils/validate";
import { reactive, ref, isRef, onMounted } from "@vue/composition-api";
export default {
  name: "login",

  // setup(props, context){
  /**
     *attrs: (...) == this.$attrs
      emit: (...) == this.$emit
      listeners: (...) == this.$listeners
      parent: (...) == this.$parent
      refs: (...) == this.$refs
      root: (...) == this
      */

  setup(props, { refs, root }) {
    // 验证用户名
    let validateUsername = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入用户名"));
      } else if (validateEmail(value)) {
        callback(new Error("用户名格式有误"));
      } else {
        callback(); //true
      }
    };
    // 验证密码
    let validatePassword = (rule, value, callback) => {
      // 过滤后的数据
      ruleForm.password = stripscript(value);
      value = ruleForm.password;
      if (value === "") {
        callback(new Error("请输入密码"));
      } else if (validatePass(value)) {
        callback(new Error("密码为6至20位数字+字母"));
      } else {
        callback();
      }
    };
    //验证重复密码
    // 验证密码
    let validatePasswords = (rule, value, callback) => {
      //如果模块值为login，直接通过
      if (model.value === "login") {
        callback();
      }
      // 过滤后的数据
      ruleForm.passwords = stripscript(value);
      value = ruleForm.passwords;
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value != ruleForm.password) {
        callback(new Error("两次密码不一样，请重新输入！~"));
      } else {
        callback();
      }
    };
    // 验证验证码
    let validateCode = (rule, value, callback) => {
      if (value === "") {
        return callback(new Error("请输入验证码"));
      } else if (validateVCode(value)) {
        return callback(new Error("验证码格式有误"));
      } else {
        callback();
      }
    };

    /**
     * 声明数据
     */
    //这里防止data数据、生命周期、自定义的函数

    //声明的数据是对象类型用reactive。    Reactive（声明单一对象时使用）取得一个对象并返回原始对象的响应数据处理。
    const obj = reactive({ count: 0 });
    const menuTab = reactive([
      { txt: "登录", current: true, type: "login" },
      { txt: "注册", current: false, type: "register" }
    ]);
    console.log(menuTab);
    //声明的数据是基础类型用ref
    //ref（声明基础数据类型变量时使用内部值并返回一个响应性且可变的ref对象。
    //ref对象具有.value指向内部值的单个属性。
    //const number = ref(0);获取值方式：number.value

    //模块值
    const model = ref("login");
    console.log(model.value);
    console.log(isRef(model) ? true : false);

    //登录按钮禁用状态
    const loginButtonStatus = ref(true);

    //验证码按钮状态
    const codeButtonStatus = reactive({
      status: false,
      text: "获取验证码"
    });

    //倒计时
    const timer = ref(null);

    //表单绑定数据
    const ruleForm = reactive({
      username: "",
      password: "",
      passwords: "",
      code: ""
    });

    //表单的验证
    const rules = reactive({
      username: [{ validator: validateUsername, trigger: "blur" }],
      password: [{ validator: validatePassword, trigger: "blur" }],
      passwords: [{ validator: validatePasswords, trigger: "blur" }],
      code: [{ validator: validateCode, trigger: "blur" }]
    });

    // //检查一个对象是否是ref对象：
    // const unwrapped = isRef(foo) ? foo.value : foo;

    // function useMousePosition() {
    //   const pos = reactive({
    //     x: 0,
    //     y: 0
    //   });
    //   return toRefs(pos);
    // }
    // const { x, y } = useMousePosition();
    // //toRefs将reactive对象转换为普通对象，保证对象解构或拓展运算符不会丢失原有响应式对象的响应。

    /**
     * 1、不建议在一个方法里面做多件不同的事件（尽可能只做自己本身的事，不要做其他人的事情）
     * 2、尽量把相同的事情封装一个方法里面，通过调用函数进行执行
     */
    /**
     * 声明函数
     */
    const toggleMenu = data => {
      console.log(data);
      menuTab.forEach(element => {
        element.current = false;
      });
      //高光
      data.current = true;
      model.value = data.type;
      //this.$refs[formName].resetFields();//2.0
      // 清除表单数据
      refs.loginForm.resetFields(); //3.0
      resetFromData();
      clearCountDown();
    };

    // 清除表单数据
    const resetFromData = () => {
      // 重置表单
      // this.$refs[formName].resetFields(); //2.0
      refs.loginForm.resetFields(); // 3.0
    };
    // 更新按钮状态
    const updataButtonStatus = params => {
      codeButtonStatus.status = params.status;
      codeButtonStatus.text = params.text;
    };
    /**
     * 获取验证码
     */

    //请求的接口
    const getSms = () => {
      //进行提示
      if (ruleForm.username == "") {
        root.$message.error("邮箱不能为空！~");
      }
      if (validateEmail(ruleForm.username)) {
        root.$message.error("邮箱格式有误，请重新输入！！");
        return false;
      }
      let requestData = {
        username: ruleForm.username,
        module: model.value
      };

      //修改获取验证码状态
      updataButtonStatus({
        status: true,
        text: "发送中"
      });
      // codeButtonStatus.status = true;
      // codeButtonStatus.text = "发送中";
      // codeButtonStatus.value = true;
      //修改按钮文字
      // codeButtonTest.value = "发送中";

      setTimeout(() => {
        GetSms(requestData)
          .then(respose => {
            let data = respose.data;
            root.$message({
              message: data.message,
              type: "success"
            });
            //启用登录或注册按钮
            loginButtonStatus.value = false;
            //调用定时器，倒计时
            countDown(6);
            console.log(data);
          })
          .catch(error => {
            console.log(error);
          });
      }, 3000);
    };

    /**
     * 提交表单
     */
    const submitForm = formName => {
      refs[formName].validate(valid => {
        if (valid) {
          model.value === "login" ? login() : register();
          // if (model.value === "login") {
          //   login();
          // } else {
          //   register();
          // }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    };

    /**
     * 登录
     */
    const login = () => {
      let requestData = {
        username: ruleForm.username,
        password: sha1(ruleForm.password),
        code: ruleForm.code
      };
      Login(requestData)
        .then(respose => {
          console.log("登录成功");
          console.log(respose);
        })
        .catch(error => {});
    };

    /**
     * 注册
     */
    const register = () => {
      let requestData = {
        username: ruleForm.username,
        password: sha1(ruleForm.password),
        code: ruleForm.code,
        module: "register"
      };
      //注册接口
      Register(requestData)
        .then(respose => {
          console.log(respose);
          let data = respose.data;
          root.$message({
            message: data.message,
            type: "success"
          });
          // codeButtonStatus.status = false;
          // codeButtonStatus.text = "再次获取";
        })
        .catch(error => {
          //失败时执行的代码
        });
    };

    /**
     * 倒计时
     */ const countDown = number => {
      //判断定时器是否存在，存在则清除
      console.log(timer.value);
      if (timer.value) {
        clearInterval(timer.value);
      }
      //setTimeout  只执行一次
      //setInterval 不断的执行，需要条件才会停止
      // setTimeout(() => {
      //   console.log("setTimeout");
      // }, 1000);
      let time = number;
      timer.value = setInterval(() => {
        time--;
        console.log(time);
        if (time === 0) {
          clearInterval(timer.value);
          updataButtonStatus({
            status: false,
            text: "再次获取"
          });
          // codeButtonStatus.status = false;
          // codeButtonStatus.text = "再次获取";
        } else {
          codeButtonStatus.text = `倒计时${time}秒`; //es5 "倒计时"+time+"秒"
        }
      }, 1000);
    };
    /**
     * 清除倒计时
     */
    const clearCountDown = () => {
      // 还原验证码按钮默认状态
      updataButtonStatus({
        status: false,
        text: "获取验证码"
      });
      // codeButtonStatus.status = false;
      // codeButtonStatus.text = "获取验证码";
      // 清除倒计时
      clearInterval(timer.value);
    };
    /**
     * 生命周期
     */
    //挂载完成后
    onMounted(() => {});

    return {
      toggleMenu,
      submitForm,
      menuTab,
      model,
      ruleForm,
      rules,
      getSms,
      loginButtonStatus,
      codeButtonStatus,
      timer
    };
  },

  created() {},

  props: {},
  watch: {}
};
</script>

<style lang="scss" scoped>
#login {
  height: 100vh;
  background-color: #344a5f;
}
.login-wrap {
  width: 330px;
  margin: auto;
}
.menu-tab {
  text-align: center;
}
li {
  display: inline-block;
  width: 88px;
  line-height: 36px;
  font-size: 14px;
  color: #fff;
  border-radius: 2px;
  cursor: pointer;
}
.current {
  background-color: rgba(0, 0, 0, 0.1);
}
.login-form {
  margin-top: 29px;
  label {
    display: block;
    margin-bottom: 3px;
    font-size: 14px;
    color: #fff;
  }
}
.item-form {
  margin-bottom: 13px;
}
.block {
  width: 100%;
  display: block;
}
.login-btn {
  margin-top: 19px;
}

.el-row {
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
}
.el-col {
  border-radius: 4px;
}
.bg-purple-dark {
  background: #99a9bf;
}
.bg-purple {
  background: #d3dce6;
}
.bg-purple-light {
  background: #e5e9f2;
}
.grid-content {
  border-radius: 4px;
  min-height: 36px;
}
.row-bg {
  padding: 10px 0;
  background-color: #f9fafc;
}
</style>

<!--
密码加密：
1、在前端预先加密一次
登录的密码：123456（普通字符串）
经过加密后：sha1('123456') == '541216ad5s4f5ds1f5asd4f65asd4' （加密后的字符串）


2、后台加密
接收到字符串：'541216ad5s4f5ds1f5asd4f65asd4'
后台再次加密：md5('541216ad5s4f5ds1f5asd4f65asd4') == '8f9qwersd3g165y4d1sf3s1f6aew4'（最终的加密后的密码）
最终新的字符串写入数据库：8f9qwersd3g165y4d1sf3s1f6aew4


3、登录
用户名与加密后的密码进行匹配，成功则登录，失败则提示
-->