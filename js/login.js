document.addEventListener('DOMContentLoaded', () => {

    // -------------------------
    // 1️⃣ تسجيل الدخول
    // -------------------------
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const phone = document.getElementById('phone').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!phone || !password) {
                alert('يرجى إدخال رقم الهاتف وكلمة السر');
                return;
            }

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    alert(data.error || 'حدث خطأ أثناء تسجيل الدخول');
                    return;
                }

                // -------------------------
                // حالة المستخدم غير مفعل
                // -------------------------
                if (!data.user.isActive) {

                    // تسجيل بياناته في localStorage رغم عدم التفعيل
                    const inactiveUser = {
                        id: data.user.id,
                        name: data.user.name,
                        phone: data.user.phone,
                        university: data.user.university,
                        faculty: data.user.faculty,
                        year: data.user.year,
                        isActive: data.user.isActive,
                        createdAt: data.user.createdAt
                    };
                    localStorage.setItem('user', JSON.stringify(inactiveUser));
                    localStorage.setItem('isLoggedIn', 'true');

                    alert('الرجاء التواصل مع الادمن لتفعيل الحساب');

                    // تحويله للصفحة الرئيسية
                    window.location.href = 'index.html';
                    return;
                }

                // -------------------------
                // حالة المستخدم مفعل
                // -------------------------
                const sessionUser = {
                    id: data.user.id,
                    name: data.user.name,
                    phone: data.user.phone,
                    university: data.user.university,
                    faculty: data.user.faculty,
                    year: data.user.year,
                    isActive: data.user.isActive,
                    createdAt: data.user.createdAt,
                    isLoggedIn: true
                };
                localStorage.setItem('user', JSON.stringify(sessionUser));
                localStorage.setItem('isLoggedIn', 'true');

                alert(`مرحباً بك، ${data.user.name}، تم تسجيل الدخول بنجاح`);

                // تحويل للصفحة الرئيسية بعد تسجيل الدخول
                window.location.href = 'index.html';

            } catch (error) {
                console.error('Login Error:', error);
                alert('حدث خطأ في الاتصال بالسيرفر');
            }
        });
    }

});