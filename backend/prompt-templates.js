export const generatorTemplates = [
    {
        category: "Social Media Marketing",
        targetAI: "ChatGPT-4o",
        intent: "Create Content",
        tags: ["#Marketing", "#SEO", "#SocialMedia", "#Content"],
        titlePrefix: {
            ar: ["استراتيجية محتوى فيروسي", "جدول منشورات شهري", "سكربت فيديو ريلز/تيك توك", "حملة إعلانات ممولة"],
            en: ["Viral Content Strategy", "Monthly Post Calendar", "Reels/TikTok Video Script", "Paid Ads Campaign"],
            fr: ["Stratégie de Contenu Viral", "Calendrier Mensuel de Posts", "Script Vidéo Reels/TikTok", "Campagne Publicitaire Payante"]
        },
        niche: {
            ar: ["العقارات", "المتاجر الإلكترونية", "التقنية وSaaS", "المدربين والاستشاريين", "اللياقة والصحة"],
            en: ["Real Estate", "E-Commerce", "SaaS & Tech", "Coaching & Consulting", "Fitness & Health"],
            fr: ["Immobilier", "E-Commerce", "SaaS & High-Tech", "Coaching & Conseil", "Santé & Fitness"]
        },
        promptFn: (t, n, lang) => {
            if (lang === 'en') return `Act as a Senior Digital Marketing Strategist in [${n}]. Create a comprehensive [${t}] including:\n1. Target audience analysis and tone of voice.\n2. 5 innovative hook angles.\n3. Copywriting with strong Call-to-Actions (CTA).\n4. Recommended hashtags and optimal posting schedule.`;
            if (lang === 'fr') return `Agissez en tant qu'expert en stratégie marketing pour [${n}]. Créez une [${t}] complète comprenant :\n1. Analyse du public cible et ton adapté.\n2. 5 accroches (Hooks) innovantes.\n3. Rédaction persuasive et appel à l'action (CTA).\n4. Hashtags recommandés et meilleur calendrier d'exposition.`;
            return `قم بدور خبير تسويق رقمي متقدم في مجال [${n}]. قم بإعداد [${t}] شامل يشمل:\n1. تحليل الجمهور المستهدف والخطاب المناسب.\n2. 5 أفكار ابتكارية مع زوايا تسويقية مختلفة (Hooks).\n3. نصوص الإعلان والدعوة لاتخاذ إجراء (CTA) القوية.\n4. الهاشتاجات الموصى بها ومواعيد النشر المثالية.`;
        },
        sampleOutput: "📌 النتيجة المتوقعة: جدول تفصيلي يحتوي على 5 منشورات أسبوعية، كل منشور يتضمن الهوك (Hook) الجاذب للجمهور، النص المقنع، وهاشتاجات مخصصة لرفع وصول الصفحة."
    },
    {
        category: "Music & Songwriting",
        targetAI: "Suno AI v4",
        intent: "Compose Music & Lyrics",
        tags: ["#Music", "#Suno", "#Synthwave", "#Audio"],
        titlePrefix: {
            ar: ["مهرجان حماسي مدروس", "أغنية Synthwave ثمانينات", "كلمات أغنية راب سينمائي", "مقطوعة Lo-Fi للدراسة"],
            en: ["Energetic Festival Anthem", "80s Synthwave Track", "Cinematic Rap Lyrics", "Lo-Fi Study Beats"],
            fr: ["Hymne de Festival Énergique", "Morceau Synthwave Années 80", "Paroles Rap Cinématique", "Beat Lo-Fi pour Étudier"]
        },
        niche: {
            ar: ["الأفلام الوثائقية", "الإعلانات التجارية", "الألعاب الإلكترونية", "البث المباشر Streamers"],
            en: ["Documentaries", "Commercials", "Video Games", "Live Streamers"],
            fr: ["Documentaires", "Publicités", "Jeux Vidéo", "Streamers En Direct"]
        },
        promptFn: (t, n, lang) => {
            if (lang === 'en') return `[Style: Cyberpunk Synthwave, 110 BPM, Heavy Bass, Vocal Chops, Nostalgic Melodies]\n[Lyrics Directive]: Write song lyrics about [${t}] designed for [${n}]. Define structure: [Verse 1], [Chorus], [Bridge], [Outro] with vocal performance directives.`;
            if (lang === 'fr') return `[Style: Cyberpunk Synthwave, 110 BPM, Basse Lourde, Melodies Nostalgiques]\n[Directive Paroles]: Écrivez les paroles d'une chanson sur [${t}] conçue pour [${n}]. Définissez la structure : [Verse 1], [Chorus], [Bridge], [Outro] avec directives vocales.`;
            return `[Style: Cyberpunk Synthwave, 110 BPM, Heavy Bass, Vocal Chops, Nostalgic Melodies]\n[Lyrics Directive]: اكتب كلمات أغنية حول [${t}] مخصصة لاستخدامها في [${n}]. حدد هيكل الأغنية: [Verse 1], [Chorus], [Bridge], [Outro] مع توجيهات الأداء الصوتي.`;
        },
        sampleOutput: "🎶 النتيجة المتوقعة: مقطع صوتي وهيكل كلمات مقسم إلى Verse وChorus جاهز للإدخال في Suno v4 لإنتاج قطعة موسيقية سينمائية بجودة ستوديو."
    },
    {
        category: "Excel & Data Analysis",
        targetAI: "Excel / VBA Engine",
        intent: "Automate Tasks",
        tags: ["#Excel", "#VBA", "#Automation", "#Data"],
        titlePrefix: {
            ar: ["كود VBA لتنظيف البيانات الأسبوعية", "دالة دمج وتصفية التلقائية", "ماكرو إنشاء تقارير PDF", "لوحة قياس تفاعلية Dashboard"],
            en: ["VBA Code for Data Cleaning", "Auto Combine & Filter Macro", "PDF Report Generator Macro", "Interactive Dashboard Setup"],
            fr: ["Code VBA pour Nettoyage de Données", "Macro de Fusion et Filtrage", "Macro Générateur de Rapports PDF", "Tableau de Bord Interactif"]
        },
        niche: {
            ar: ["المبيعات والمالية", "إدارة المخزون", "الموارد البشرية HR", "تتبع الطلبات الشحن"],
            en: ["Sales & Finance", "Inventory Management", "Human Resources HR", "Order & Shipment Tracking"],
            fr: ["Ventes et Finance", "Gestion des Stocks", "Ressources Humaines RH", "Suivi des Commandes"]
        },
        promptFn: (t, n, lang) => {
            if (lang === 'en') return `Write an error-free production VBA script for Excel tailored for [${n}]. Implement [${t}]:\n- Handle missing/duplicate data gracefully.\n- Add a click button trigger.\n- Include clean step-by-step documentation on how to paste in VBA Module.`;
            if (lang === 'fr') return `Écrivez un script VBA complet sans erreur pour Excel personnalisé pour [${n}]. Réalisez [${t}] :\n- Gérez les données manquantes ou en double.\n- Ajoutez un bouton d'exécution.\n- Incluez la documentation pas-à-pas.`;
            return `قم بكتابة سكربت VBA مكتمل بدون أخطاء لوحدة Excel مخصص لـ [${n}]. المطلوب تنفيذ [${t}]:\n- التعامل مع القيم المفقودة والمكررة.\n- إضافة زر تفاعلي لتشغيل الكود بنقرة واحدة.\n- توثيق الكود وتوضيح كيفية تركيبه خطوة بخطوة في الماكرو.`;
        },
        sampleOutput: "📊 النتيجة المتوقعة: كود برمجية VBA نظيف ومكتمل مع شرح كيفية لزقه في نافذة Alt+F11 في إكسل لإنشاء أزرار أتمتة التقارير التلقائية."
    },
    {
        category: "Coding & Web Dev",
        targetAI: "Claude 3.5 Sonnet",
        intent: "Write Code & Scripts",
        tags: ["#Coding", "#React", "#Python", "#SaaS"],
        titlePrefix: {
            ar: ["مكون React كامل ومستجيب", "واجهة برمجية REST API في Node.js", "سكربت أتمتة Python Web Scraping", "تصميم قاعدة بيانات PostgreSQL"],
            en: ["Responsive React Component", "Node.js REST API Endpoint", "Python Web Scraping Automation", "PostgreSQL Database Schema"],
            fr: ["Composant React Responsive", "API REST Node.js", "Script Python de Web Scraping", "Schéma de Base de Données PostgreSQL"]
        },
        niche: {
            ar: ["منصات التعليم الإلكتروني", "لوحات تحكم التجار Admin Dashboards", "التطبيقات المالية Fintech", "أنظمة إدارة المحتوى"],
            en: ["EdTech Platforms", "Admin Dashboards", "Fintech Apps", "CMS Platforms"],
            fr: ["Plateformes Éducatives", "Tableaux de Bord Admin", "Applications Fintech", "Systèmes CMS"]
        },
        promptFn: (t, n, lang) => {
            if (lang === 'en') return `You are a Lead Software Engineer. Build a production-grade [${t}] for [${n}].\nRequirements:\n- Modular, clean code with full try/catch error handling.\n- Clear comments, security best practices, and performance optimization.`;
            if (lang === 'fr') return `Vous êtes un Ingénieur Logiciel Senior. Créez un [${t}] pour [${n}].\nExigences :\n- Code propre, modulaire, gestion robuste des erreurs try/catch.\n- Commentaires explicatifs, sécurité et optimisation des performances.`;
            return `أنت مهندس برمجيات رائد (Staff Engineer). قم بتطوير [${t}] لتطبيق في مجال [${n}].\nالمتطلبات:\n- كود نظيف، موديولار، ومعالج للأخطاء try/catch.\n- كتابة تعليقات توضيحية كاملة ومراعاة أفضل ممارسات الأمان والأداء.`;
        },
        sampleOutput: "💻 النتيجة المتوقعة: كود برمجية متكامل بدون أجزاء ناقصة مع معالجة الأخطاء (Error Boundaries) وتطبيق تنسيقات Tailwind CSS المستجيبة."
    },
    {
        category: "AI Image Generation",
        targetAI: "Midjourney v6",
        intent: "Generate Visual Art",
        tags: ["#Midjourney", "#Art", "#3D", "#Design"],
        titlePrefix: {
            ar: ["مشهد سينمائي عالي الدقة Photorealistic", "شعار ثنائي الأبعاد مستقبلي Minimalist", "شخصية ثلاثية الأبعاد 3D Isometric", "تصميم واجهة تطبيق UI/UX View"],
            en: ["Hyper-Realistic Cinematic Scene", "Futuristic Minimalist Logo", "3D Isometric Character Design", "UI/UX Mobile App View"],
            fr: ["Scène Cinématique Hyper-Réaliste", "Logo Minimaliste Futuriste", "Design de Personnage 3D Isométrique", "Interface d'Application Mobile UI/UX"]
        },
        niche: {
            ar: ["الألعاب الرقمية", "الهوية البصرية للماركات", "التصميم المعماري", "الأفلام والخيال العلمي"],
            en: ["Gaming Assets", "Brand Identity", "Architectural Rendering", "Sci-Fi Movies"],
            fr: ["Jeux Vidéo", "Identité de Marque", "Rendu Architectural", "Films de Science-Fiction"]
        },
        promptFn: (t, n, lang) => {
            return `A high-detail prompt for [${t}] tailored for [${n}].\nPrompt: Cinematic photo of [Subject/Topic], octane render, volumetric lighting, hyper-realistic details, shot on 85mm lens, f/1.8, 8k resolution, color graded --ar 16:9 --v 6.0 --stylize 250`;
        },
        sampleOutput: "🖼️ النتيجة المتوقعة: برومبت هندسي فوتوغرافي دقيق لـ Midjourney v6 يتضمن معاملات الإضاءة وعدسة التصوير والأبعاد --ar 16:9 لتوليد صورة سينمائية."
    },
    {
        category: "E-Commerce & Stores",
        targetAI: "ChatGPT-4o",
        intent: "Optimize Business & Sales",
        tags: ["#Shopify", "#ECommerce", "#Sales", "#Copywriting"],
        titlePrefix: {
            ar: ["وصف منتج بائع على Shopify", "استراتيجية تقليل سلة التسوق المهجورة", "صفحة هبوط عالية التحويل Landing Page", "خطة تسعير وتخفيضات موسمية"],
            en: ["High-Converting Shopify Product Description", "Abandoned Cart Recovery Flow", "High-Converting Landing Page Copy", "Seasonal Pricing & Discount Strategy"],
            fr: ["Description Produit Shopify Haute Conversion", "Stratégie Panier Abandonné", "Texte de Landing Page Optimisé", "Stratégie de Prix et Promos Saisonnières"]
        },
        niche: {
            ar: ["الموضة والأزياء", "الإلكترونيات والحلول الذكية", "التجميل والعناية", "المنتجات المنزلية"],
            en: ["Fashion & Apparel", "Consumer Electronics", "Beauty & Skincare", "Home & Living"],
            fr: ["Mode & Vêtements", "Électronique Grand Public", "Beauté & Soins", "Maison & Décoration"]
        },
        promptFn: (t, n, lang) => {
            if (lang === 'en') return `Act as a CRO & E-Commerce Copywriter for a store selling in [${n}]. Write a high-converting [${t}] that drives immediate purchases, highlighting key benefits, urgency triggers, and social proof.`;
            if (lang === 'fr') return `Agissez en tant que concepteur-rédacteur e-commerce pour une boutique dans [${n}]. Écrivez une [${t}] à fort taux de conversion stimulant l'achat immédiat en mettant en avant les bénéfices et la preuve sociale.`;
            return `قم بدور خبير زيادة المبيعات (CRO Specialist) لمتجر إلكتروني في قطاع [${n}]. اكتب [${t}] محفز للشراء يحفز العميل على اتخاذ قرار فورياً، مع إبراز الفوائد والحلول والمراجعات الاجتماعية.`;
        },
        sampleOutput: "🛍️ النتيجة المتوقعة: نص إعلاني تجاري جاهز لصفحات الهبوط مع إبراز نقاط الألم والفوائد والدعوة الصريحة للشراء لتخصيصه فورياً."
    }
];
