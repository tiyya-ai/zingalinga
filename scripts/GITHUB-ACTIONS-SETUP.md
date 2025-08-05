# 🚀 إعداد GitHub Actions للنشر التلقائي

## 📋 نظرة عامة

تم إنشاء نظام نشر تلقائي متقدم باستخدام GitHub Actions يقوم بنشر موقع Zinga Linga تلقائياً عند كل push إلى فرع main/master.

## 🔧 خطوات الإعداد

### 1. إعداد GitHub Repository

```bash
# إذا لم تكن قد ربطت المشروع بـ GitHub بعد
git init
git add .
git commit -m "Initial commit: Zinga Linga project with auto-deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/zinga-linga-nextjs.git
git push -u origin main
```

### 2. إعداد SSH Key للـ VPS

#### أ. إنشاء SSH Key جديد (إذا لم يكن موجود)

```bash
# على جهازك المحلي
ssh-keygen -t rsa -b 4096 -C "github-actions@zingalinga.io"
# احفظ المفتاح في: ~/.ssh/zinga_linga_deploy
```

#### ب. إضافة المفتاح العام إلى VPS

```bash
# نسخ المفتاح العام
cat ~/.ssh/zinga_linga_deploy.pub

# الاتصال بـ VPS وإضافة المفتاح
ssh root@109.199.106.28
mkdir -p ~/.ssh
echo "YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### 3. إعداد GitHub Secrets

اذهب إلى إعدادات مستودع GitHub:
`Settings` → `Secrets and variables` → `Actions` → `New repository secret`

أضف الأسرار التالية:

| اسم السر | القيمة | الوصف |
|----------|--------|--------|
| `VPS_HOST` | `109.199.106.28` | عنوان IP الخاص بـ VPS |
| `VPS_USER` | `root` | اسم المستخدم |
| `VPS_SSH_KEY` | `محتوى المفتاح الخاص` | المفتاح الخاص SSH |

#### كيفية الحصول على المفتاح الخاص:

```bash
# عرض المفتاح الخاص
cat ~/.ssh/zinga_linga_deploy

# انسخ المحتوى كاملاً بما في ذلك:
# -----BEGIN OPENSSH PRIVATE KEY-----
# ... محتوى المفتاح ...
# -----END OPENSSH PRIVATE KEY-----
```

### 4. إعداد VPS للنشر التلقائي

```bash
# الاتصال بـ VPS
ssh root@109.199.106.28

# تثبيت Node.js (إذا لم يكن مثبت)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# تثبيت PM2
npm install -g pm2

# إنشاء مجلد التطبيق
mkdir -p /var/www/zinga-linga
chown -R $USER:$USER /var/www/zinga-linga

# إعداد PM2 للتشغيل التلقائي
pm2 startup
pm2 save
```

## 🎯 كيف يعمل النظام

### عند كل Push إلى main/master:

1. **📥 سحب الكود** من GitHub
2. **🔧 تثبيت التبعيات** (`npm ci`)
3. **🏗️ بناء التطبيق** (`npm run build`)
4. **📦 إنشاء حزمة النشر** (ضغط الملفات المطلوبة)
5. **⬆️ رفع الحزمة** إلى VPS عبر SCP
6. **🚀 النشر على VPS**:
   - إيقاف التطبيق الحالي
   - استخراج الملفات الجديدة
   - تثبيت التبعيات
   - تشغيل التطبيق مع PM2
7. **✅ التحقق من النشر** والإشعار بالنتيجة

### المميزات المتقدمة:

- 🔄 **نسخ احتياطية تلقائية** قبل كل نشر
- 🧹 **تنظيف ذكي** للملفات القديمة
- 📊 **تقارير مفصلة** لكل عملية نشر
- ⚡ **نشر سريع** (يحتفظ بـ node_modules)
- 🔍 **فحص صحة التطبيق** بعد النشر

## 🔍 مراقبة النشر

### عرض سجلات GitHub Actions

1. اذهب إلى تبويب `Actions` في مستودع GitHub
2. اختر آخر workflow run
3. راقب تقدم كل خطوة في الوقت الفعلي

### فحص التطبيق على VPS

```bash
# فحص حالة PM2
ssh root@109.199.106.28 "pm2 status"

# عرض سجلات التطبيق
ssh root@109.199.106.28 "pm2 logs zinga-linga"

# فحص الوصول للموقع
curl -I http://zingalinga.io
```

## 🛠️ استكشاف الأخطاء

### مشاكل شائعة وحلولها:

#### 1. خطأ في SSH Connection
```bash
# تأكد من صحة المفتاح
ssh -i ~/.ssh/zinga_linga_deploy root@109.199.106.28

# إعادة إضافة المفتاح العام إلى VPS
```

#### 2. فشل في البناء
```bash
# تأكد من عدم وجود أخطاء في الكود محلياً
npm run build

# تحقق من إعدادات Node.js على VPS
```

#### 3. مشاكل PM2
```bash
# إعادة تشغيل PM2
ssh root@109.199.106.28 "pm2 restart zinga-linga"

# إعادة تحميل إعدادات PM2
ssh root@109.199.106.28 "pm2 reload zinga-linga"
```

## 🔐 الأمان

### أفضل الممارسات:

- ✅ استخدم مفاتيح SSH منفصلة للنشر
- ✅ قيّد صلاحيات المفتاح على VPS
- ✅ راقب سجلات النشر بانتظام
- ✅ استخدم فروع منفصلة للتطوير
- ✅ اختبر التغييرات قبل الدمج في main

### إعدادات أمان إضافية:

```bash
# على VPS - تقييد صلاحيات SSH
echo 'command="cd /var/www/zinga-linga && $SSH_ORIGINAL_COMMAND" YOUR_PUBLIC_KEY' >> ~/.ssh/authorized_keys
```

## 📊 مراقبة الأداء

### إعداد مراقبة تلقائية:

```bash
# على VPS - إعداد مراقبة PM2
pm2 install pm2-server-monit

# إعداد تنبيهات
pm2 set pm2-server-monit:conf '{"email": "admin@zingalinga.io"}'
```

## 🎉 اختبار النظام

### اختبار النشر التلقائي:

1. **قم بتعديل بسيط** في الكود
2. **اعمل commit و push**:
   ```bash
   git add .
   git commit -m "Test auto-deployment"
   git push origin main
   ```
3. **راقب تبويب Actions** في GitHub
4. **تحقق من الموقع** على http://zingalinga.io

## 📞 الدعم

في حالة مواجهة مشاكل:

1. **تحقق من سجلات GitHub Actions**
2. **فحص سجلات VPS**: `ssh root@109.199.106.28 "pm2 logs zinga-linga"`
3. **تأكد من صحة GitHub Secrets**
4. **اختبر الاتصال SSH يدوياً**

---

## 🎯 الخطوات التالية

بعد إعداد النشر التلقائي:

- [ ] إعداد SSL Certificate للموقع
- [ ] تكوين NGINX للأداء الأمثل
- [ ] إعداد مراقبة الأداء
- [ ] إضافة اختبارات تلقائية
- [ ] إعداد بيئة staging منفصلة

**🚀 مع GitHub Actions، أصبح النشر تلقائياً وآمناً!**