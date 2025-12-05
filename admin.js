// --- ⬇️ 确保这里的钥匙是你自己的！ ⬇️ ---
const SUPABASE_URL = 'https://bevnggoqlqgrzemcbuar.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJldm5nZ29xbHFncnplbWNidWFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MDk3NzIsImV4cCI6MjA4MDQ4NTc3Mn0.kDICGh7Gb4nhYZNiLjzXBquf1mCzT3tk8jfVk0ZKgPg';
// --- ⬆️ 确保这里的钥匙是你自己的！ ⬆️ ---

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 💡💡💡 主要的改动在这里 💡💡💡
// 我们把所有代码都放进这个 "DOMContentLoaded" 事件监听器里
// 确保 HTML 完全加载后，再运行 JavaScript
document.addEventListener('DOMContentLoaded', () => {

    // --- 把所有之前的代码都搬到这里面 ---
    const loginForm = document.getElementById('login-form');
    const adminPanel = document.getElementById('admin-panel');
    const userEmailSpan = document.getElementById('user-email');
    const resourceList = document.getElementById('resource-list');

    function checkUserSession(session) {
        if (session) {
            loginForm.classList.add('hidden');
            adminPanel.classList.remove('hidden');
            userEmailSpan.textContent = session.user.email;
            loadResources();
        } else {
            loginForm.classList.remove('hidden');
            adminPanel.classList.add('hidden');
        }
    }

    async function loadResources() {
        const { data, error } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
        if (error) return;
        resourceList.innerHTML = '';
        data.forEach(resource => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${resource.name} (${resource.category})</span>`;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '删除';
            deleteButton.onclick = async () => {
                if (confirm(`确定要删除 "${resource.name}" 吗？`)) {
                    await supabase.from('resources').delete().eq('id', resource.id);
                    loadResources();
                }
            };
            li.appendChild(deleteButton);
            resourceList.appendChild(li);
        });
    }

    // 绑定登录按钮的点击事件
    document.getElementById('login-button').addEventListener('click', async () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            alert('登录失败: ' + error.message);
        } else {
            checkUserSession(data.session);
        }
    });

    // 绑定退出按钮的点击事件
    document.getElementById('logout-button').addEventListener('click', async () => {
        await supabase.auth.signOut();
        checkUserSession(null); // 直接调用 checkUserSession 来更新界面
    });

    // 绑定添加按钮的点击事件
    document.getElementById('add-button').addEventListener('click', async () => {
        const name = document.getElementById('newName').value.trim();
        const url = document.getElementById('newUrl').value.trim();
        if (!name || !url) return alert('名称和链接不能为空！');

        const { error } = await supabase.from('resources').insert([{
            name: name,
            description: document.getElementById('newDesc').value.trim(),
            category: document.getElementById('newCategory').value.trim(),
            url: url
        }]);

        if (error) {
            alert('添加失败: ' + error.message);
        } else {
            document.getElementById('newName').value = '';
            document.getElementById('newDesc').value = '';
            document.getElementById('newCategory').value = '';
            document.getElementById('newUrl').value = '';
            loadResources();
        }
    });

    // --- 页面加载时的初始检查 ---
    supabase.auth.getSession().then(({ data: { session } }) => {
        checkUserSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
        checkUserSession(session);
    });

}); // <-- "DOMContentLoaded" 的结束括号
