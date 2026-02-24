document.addEventListener('DOMContentLoaded', async () => {
    // --- تعريف العناصر ---
    const universitySelect = document.getElementById('university');
    const facultySelect = document.getElementById('faculty');
    const yearSelect = document.getElementById('year');
    const registerForm = document.getElementById('registerForm'); // <--- مهم جداً

    let firstData = [];
    let secondData = [];

    // --- تحميل الجامعات ---
    try {
        const res1 = await fetch('json/first.json');
        firstData = Object.values((await res1.json()).tree || {}).filter(u => u.isActive);
        firstData.forEach(u => {
            const option = document.createElement('option');
            option.value = u.id;
            option.textContent = u.name;
            universitySelect.appendChild(option);
        });
    } catch (err) {
        console.error('Failed to load first.json', err);
    }

    // --- تحميل الكليات والسنوات ---
    try {
        const res2 = await fetch('json/second.json');
        secondData = (await res2.json()).universities_data || [];
    } catch (err) {
        console.error('Failed to load second.json', err);
    }

    // --- عند اختيار الجامعة ---
    universitySelect.addEventListener('change', () => {
        facultySelect.innerHTML = '<option value="">Select Faculty</option>';
        yearSelect.innerHTML = '<option value="">Select Year</option>';

        const uniId = universitySelect.value;
        const uniData = secondData.find(u => u.university_id === uniId);
        if (!uniData) return;

        uniData.faculties.forEach(fac => {
            const option = document.createElement('option');
            option.value = fac.id;
            option.textContent = fac.name;
            facultySelect.appendChild(option);
        });
    });

    // --- عند اختيار الكلية ---
    facultySelect.addEventListener('change', () => {
        yearSelect.innerHTML = '<option value="">Select Year</option>';
        const uniId = universitySelect.value;
        const uniData = secondData.find(u => u.university_id === uniId);
        if (!uniData) return;

        const facId = facultySelect.value;
        const facData = uniData.faculties.find(f => f.id === facId);
        if (!facData) return;

        facData.years.forEach(y => {
            const option = document.createElement('option');
            option.value = y.year;
            option.textContent = y.name;
            yearSelect.appendChild(option);
        });
    });

    // --- تسجيل المستخدم عند الضغط على الفورم ---
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newUser = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            password: document.getElementById('password').value, // ✅ تم إضافة الباسورد
            university: universitySelect.value,
            faculty: facultySelect.value,
            year: yearSelect.value
        };

        try {
            const res = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });

            const data = await res.json();
            if (res.ok) {
                alert('تم التسجيل بنجاح');
                registerForm.reset();
            } else {
                alert('خطأ: ' + data.error);
            }
        } catch (err) {
            console.error(err);
            alert('حدث خطأ أثناء التسجيل');
        }
    });
});