<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Logo from '../components/Logo.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = reactive({ username: '', password: '' })
const submitting = ref(false)
const errorMsg = ref('')

async function onSubmit() {
  if (submitting.value) return
  errorMsg.value = ''
  if (!form.username || !form.password) {
    errorMsg.value = '请填写用户名和密码'
    return
  }
  submitting.value = true
  try {
    await authStore.login(form)
    router.push(route.query.redirect || { name: 'chat' })
  } catch (e) {
    errorMsg.value = e.response?.data?.message || e.message
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="auth-wrap">
    <div class="auth-card">
      <header>
        <Logo :size="44" />
        <h1>欢迎回到 Chatbox</h1>
        <p class="lead">教学版 · Vue 3 + Express + SQLite</p>
      </header>

      <form @submit.prevent="onSubmit" autocomplete="on">
        <label>
          <span>用户名</span>
          <input v-model="form.username" autofocus autocomplete="username" placeholder="2 位以上">
        </label>
        <label>
          <span>密码</span>
          <input v-model="form.password" type="password" autocomplete="current-password" placeholder="4 位以上">
        </label>

        <p v-if="errorMsg" class="error">⚠️ {{ errorMsg }}</p>

        <button type="submit" :disabled="submitting" class="primary">
          {{ submitting ? '登录中...' : '登录' }}
        </button>
      </form>

      <p class="switch">
        还没有账号？<RouterLink to="/register">去注册</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-wrap {
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  background:
    radial-gradient(circle at 80% 10%, rgba(99, 102, 241, 0.08), transparent 55%),
    radial-gradient(circle at 10% 90%, rgba(34, 211, 238, 0.08), transparent 55%),
    var(--bg-base);
  padding: 24px;
}
.auth-card {
  width: 100%;
  max-width: 380px;
  background: var(--bg-elevated);
  border-radius: var(--radius-lg);
  padding: 32px 32px 28px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
}

.auth-card header {
  text-align: center;
  margin-bottom: 28px;
}
.auth-card header > :deep(svg) { display: inline-block; }

h1 { margin: 14px 0 4px; font-size: 20px; font-weight: 600; letter-spacing: -0.01em; }
.lead { margin: 0; color: var(--text-dim); font-size: 12.5px; }

form { display: flex; flex-direction: column; gap: 14px; }
label { display: flex; flex-direction: column; gap: 6px; }
label span { font-size: 12px; color: var(--text-muted); font-weight: 500; }

input {
  padding: 10px 12px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  font-size: 14px;
  color: var(--text);
}
input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
}

.error {
  margin: 0;
  padding: 8px 12px;
  background: var(--danger-bg);
  border-left: 3px solid var(--danger);
  border-radius: 0 4px 4px 0;
  color: #b91c1c;
  font-size: 13px;
}

.primary {
  margin-top: 4px;
  padding: 10px 16px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  font-weight: 500;
  transition: background 0.15s, transform 0.12s;
}
.primary:hover:not(:disabled) { background: var(--accent-hover); transform: translateY(-1px); }
.primary:disabled { opacity: 0.55; cursor: not-allowed; }

.switch {
  margin: 18px 0 0;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
}
.switch a { color: var(--accent); font-weight: 500; }
.switch a:hover { text-decoration: underline; }
</style>
