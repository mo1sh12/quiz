document.addEventListener('DOMContentLoaded', async () => {
    const sessionUser = JSON.parse(localStorage.getItem('user'));
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    // ✅ فقط إذا لم يكن مسجلاً، نعيده للـ login
    if (!isLoggedIn || !sessionUser) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // قراءة ملف المستخدمين JSON
        const res = await fetch('json/users/users.json');
        if (!res.ok) throw new Error('فشل تحميل ملف المستخدمين');
        const users = await res.json();

        const dbUser = users.find(u => u.id === sessionUser.id);

        if (!dbUser) {
            alert('حسابك غير موجود، سيتم تحويلك لصفحة تسجيل الدخول');
            window.location.href = 'login.html';
            return;
        }

        // -------------------------
        // حالة المستخدم غير مفعل
        // -------------------------
        let isInactive = false;
        if (!dbUser.isActive) {
            isInactive = true;
            alert('حسابك غير مفعل، بعض الميزات ستكون مقفلة');
            // نستمر في تحميل الصفحة لكنه سيكون مقفل الميزات المميزة
        }

        // ----------------------------
        // إذا وصلنا هنا، المستخدم موجود و السيشن مسجل → نكمل باقي الكود في الصفحة
        // ----------------------------

        // إنشاء status box
        const statusContainer = document.createElement('div');
        statusContainer.style.position = 'fixed';
        statusContainer.style.top = '10px';
        statusContainer.style.right = '10px';
        statusContainer.style.padding = '8px 12px';
        statusContainer.style.borderRadius = '6px';
        statusContainer.style.fontSize = '14px';
        statusContainer.style.zIndex = '9999';
        statusContainer.style.backgroundColor = isInactive ? '#ffc107' : '#28a745';
        statusContainer.style.color = '#fff';
        statusContainer.style.cursor = 'pointer';
        statusContainer.innerHTML = isInactive
            ? `🟡 Account Inactive<br>${dbUser.name}`
            : `🟢 Account Active<br>${dbUser.name}`;
        document.body.appendChild(statusContainer);

        // إنشاء popup عند الضغط على status box
        const popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.top = '50px';
        popup.style.right = '10px';
        popup.style.padding = '12px';
        popup.style.borderRadius = '8px';
        popup.style.backgroundColor = '#f8f9fa';
        popup.style.color = '#000';
        popup.style.border = '1px solid #ccc';
        popup.style.fontSize = '14px';
        popup.style.zIndex = '10000';
        popup.style.display = 'none';
        popup.style.minWidth = '180px';
        popup.innerHTML = `
            <strong>Name:</strong> ${dbUser.name} <br>
            <strong>Phone:</strong> ${dbUser.phone} <br>
            <strong>University:</strong> ${dbUser.university} <br>
            <strong>Faculty:</strong> ${dbUser.faculty} <br>
            <strong>Year:</strong> ${dbUser.year} <br>
            <button id="logoutBtn" style="margin-top:8px;padding:4px 8px;border:none;border-radius:4px;background:#dc3545;color:#fff;cursor:pointer;">Logout</button>
        `;
        document.body.appendChild(popup);

        // إظهار / إخفاء popup عند الضغط على status box
        statusContainer.addEventListener('click', () => {
            popup.style.display = popup.style.display === 'none' ? 'block' : 'none';
        });

        // تسجيل الخروج عند الضغط على الزر
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.clear(); // مسح كل بيانات الجلسة
            window.location.href = 'login.html';
        });

        // إخفاء popup إذا ضغط المستخدم في أي مكان آخر
        document.addEventListener('click', (e) => {
            if (!statusContainer.contains(e.target) && !popup.contains(e.target)) {
                popup.style.display = 'none';
            }
        });

        // ----------------------------
        // التحكم بالميزات حسب حالة الحساب
        // ----------------------------
        // نفترض أن جميع عناصر الميزات لديها attribute data-premium="true" أو false
        const allFeatures = document.querySelectorAll('[data-premium]');
        if (isInactive) {
            allFeatures.forEach(feature => {
                if (feature.getAttribute('data-premium') === 'true') {
                    feature.style.pointerEvents = 'none'; // منع التفاعل
                    feature.style.opacity = '0.4'; // تخفيف العرض كإشارة للقفل
                    feature.title = "هذه الميزة غير متاحة لحسابك غير المفعل";
                }
            });
        }

        // ✅ هنا يمكن إضافة أي كود إضافي للمستخدم النشط بعد التأكد من السيشن

    } catch (err) {
        console.error('Error checking user status:', err);
        alert('حدث خطأ أثناء التحقق من حالة الحساب');
        window.location.href = 'login.html';
    }
});