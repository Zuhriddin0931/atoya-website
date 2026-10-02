/*
 * ATOYA — simple UZ / RU / EN language switcher.
 *
 * How it works:
 *  - Uzbek is the default and is written directly in the HTML.
 *  - Elements with data-i18n="key" get their content replaced with the
 *    translation of that key; data-i18n-attr="attr:key;attr2:key2" does the
 *    same for attributes (placeholder, alt, aria-label, content, ...).
 *  - The original Uzbek text is saved on the element itself
 *    (data-i18n-uz / data-i18n-uz-<attr>), so switching back to UZ needs no
 *    Uzbek dictionary and cloned elements (e.g. carousel clones) keep working.
 *  - The chosen language is remembered in localStorage and can also be
 *    forced with ?lang=ru / ?lang=en in the URL.
 */
(function () {
    "use strict";

    var LANGS = ["uz", "ru", "en"];
    var STORAGE_KEY = "atoya-lang";

    var dict = {
        // Strings used only from JavaScript (no Uzbek text in the HTML)
        uz: {
            "form.note": "Rahmat! Hozircha so‘rovlar telefon orqali qabul qilinadi: +998 (99) 309-58-00",
            "owl.prev": "Oldingi",
            "owl.next": "Keyingi",
            "cat.curtain": "Parda dizayni",
            "cat.outfit": "Ayollar libosi",
            "p.pillows": "Dekorativ yostiqlar",
            "p.tabledecor": "Banket stol bezagi",
            "catalog.more": "Yana ko‘rsatish",
            "catalog.photos": "ta rasm",
            "pm.photo": "Rasm",
            "pm.view": "Rasmlarni ko‘rish",
            "pm.close": "Yopish",
            "tile2.title": "Erkaklar kolleksiyasi",
            "tile3.title": "Bolalar kolleksiyasi",

            // Uzbek text for catalog cards rendered from JavaScript
            "tag.curtains": "Pardalar",
            "tag.blinds": "Jalyuzi",
            "tag.women": "Ayollar",
            "tag.men": "Erkaklar",
            "tag.kids": "Bolalar",
            "card.price": "Narxi kelishiladi",
            "card.order": "Buyurtma berish",
            "btn.more": "Batafsil",
            "p.blackout": "Blackout pardalar",
            "p.classic": "Klassik pardalar",
            "p.theatre": "Teatralka pardalar",
            "p.luversak": "Luversak pardalar",
            "p.festive": "Bayramona ko‘ylaklar",
            "p.bridal": "Kelinlar uchun ko‘ylaklar",
            "p.girls": "Qizlar uchun ko‘ylaklar",
            "p.horizontal": "Gorizontal jalyuzi",
            "p.roman": "Rimskiy jalyuzi",
            "p.roller": "Rollo jalyuzi",
            "p.vertical": "Vertikal jalyuzi",
            "p.m1": "Bahorgi klassika",
            "p.m2": "Erkaklar kundalik uslubi",
            "p.m3": "Erkaklar klassik uslubi",
            "p.w1": "Yashil jaket",
            "p.w2": "Klassik ko‘ylak",
            "p.w3": "Bahorgi kolleksiya",
            "p.k1": "Maktab kolleksiyasi",
            "p.k2": "Yozgi kolleksiya",
            "p.k3": "Bolalar klassik uslubi"
        },

        ru: {
            "form.note": "Спасибо! Пока заявки принимаются по телефону: +998 (99) 309-58-00",
            "owl.prev": "Назад",
            "owl.next": "Вперёд",

            // Catalog & product gallery
            "cat.curtain": "Дизайн штор",
            "soon.title": "Скоро",
            "soon.lead": "Мы работаем над новой коллекцией.",
            "soon.text": "Новые изделия совсем скоро появятся в каталоге — следите за обновлениями.",
            "soon.back": "Смотреть другие коллекции",
            "cat.outfit": "Женский наряд",
            "p.pillows": "Декоративные подушки",
            "p.tabledecor": "Оформление банкетных столов",
            "catalog.more": "Показать ещё",
            "catalog.photos": "фото",
            "pm.photo": "Фото",
            "pm.view": "Смотреть фото",
            "pm.close": "Закрыть",

            // Meta
            "meta.index.title": "ATOYA — Шторы и интерьерные решения | Ташкент",
            "meta.index.desc": "ATOYA — современные решения для штор и интерьера в Ташкенте. Качественные шторы, профессиональный пошив и установка для квартир, офисов, ресторанов, гостиниц и крупных объектов.",
            "meta.about.title": "О нас — ATOYA | Шторы и интерьерные решения",
            "meta.about.desc": "О компании ATOYA: команда специалистов с многолетним опытом в области штор, жалюзи и интерьерных решений. Замер, пошив и установка.",
            "meta.products.title": "Каталог — ATOYA | Шторы, жалюзи и одежда",
            "meta.products.desc": "Каталог ATOYA: шторы, жалюзи, а также коллекции женской, мужской и детской одежды. Индивидуальный заказ и профессиональная установка.",
            "meta.single.title": "Шторы блэкаут — ATOYA",
            "meta.single.desc": "Шторы блэкаут — ATOYA. Современные светонепроницаемые шторы, сшитые индивидуально по размерам вашего помещения. Замер и установка.",
            "meta.contact.title": "Контакты — ATOYA | Шторы и интерьерные решения",
            "meta.contact.desc": "Свяжитесь с ATOYA: +998 (99) 309-58-00. Адрес: Ташкентская область, Зангиатинский район, улица Амира Темура, дом 217. Часы работы: 08:00 - 20:00.",

            // Accessibility & header
            "a11y.skip": "Перейти к основному содержанию",
            "a11y.phone": "Телефон",
            "brand.home": "ATOYA — главная страница",
            "nav.toggle": "Открыть меню",
            "nav.main": "Главное меню",
            "lang.label": "Выбор языка",
            "nav.home": "Главная",
            "nav.curtains": "Шторы",
            "nav.clothing": "Нарядная одежда",
            "nav.blinds": "Жалюзи",
            "nav.pages": "Страницы",
            "nav.about": "О нас",
            "nav.products": "Продукция",
            "nav.single": "Страница товара",
            "nav.contact": "Связаться с нами",

            // Hero
            "hero.eyebrow": "Шторы и интерьерные решения · Ташкент",
            "hero.title": "Не просто шторы — характер вашего пространства",
            "hero.text": "Шторы, созданные в гармонии вкуса, качества и мастерства",
            "hero.cta": "Бесплатная консультация!",
            "hero.call": "Позвонить",
            "hero.alt": "Современные шторы и интерьерные решения ATOYA",
            "tile1.title": "Коллекция нарядной одежды",
            "tile1.sub": "Особый стиль для женщин, девушек и невест",
            "tile1.htitle": "Для женщин и девушек",
            "tile1.text": "Повседневная, праздничная и особая одежда в современном и изящном стиле.",
            "tile2.title": "Мужская коллекция",
            "tile2.sub": "Гармония классики и современности",
            "tile2.htitle": "Для мужчин",
            "tile2.text": "Мужественный стиль, современный вкус.",
            "tile3.title": "Детская коллекция",
            "tile3.sub": "Особый стиль для каждого мгновения детства",
            "tile3.text": "Особый стиль для каждого малыша.",
            "tile4.title": "Жалюзи",
            "tile4.sub": "Качественные жалюзи для дома и офиса",
            "tile4.htitle": "Современные жалюзи",
            "tile4.text": "Современный способ управлять светом и добавить интерьеру изящества.",
            "btn.more": "Подробнее",
            "btn.soon": "Скоро!",

            // Product sections
            "men.eyebrow": "Шторы",
            "men.title": "Коллекция изящества",
            "men.text": "Современные шторы, пошив штор и индивидуальные заказы в Ташкенте. Качественные интерьерные решения для квартир, офисов, ресторанов, гостиниц и крупных объектов.",
            "women.eyebrow": "Нарядная одежда",
            "women.title": "Коллекция одежды",
            "women.text": "Одежда, отражающая современный стиль и изящество.",
            "kids.eyebrow": "Жалюзи",
            "kids.title": "Жалюзи — гармония света и изящества",
            "kids.text": "Современные жалюзи созданы для управления солнечным светом, обеспечения приватности и придания интерьеру ещё большего изящества.",
            "tag.curtains": "Шторы",
            "tag.clothing": "Одежда",
            "tag.blinds": "Жалюзи",
            "tag.women": "Женщинам",
            "tag.men": "Мужчинам",
            "tag.kids": "Детям",
            "card.order": "Заказать",
            "card.zoom": "Увеличить изображение",
            "card.price": "Цена договорная",
            "p.blackout": "Шторы блэкаут",
            "p.classic": "Классические шторы",
            "p.theatre": "Театральные шторы",
            "p.luversak": "Шторы на люверсах",
            "p.festive": "Праздничные платья",
            "p.bridal": "Платья для невест",
            "p.girls": "Платья для девушек",
            "p.horizontal": "Горизонтальные жалюзи",
            "p.roman": "Римские шторы",
            "p.roller": "Рулонные шторы",
            "p.vertical": "Вертикальные жалюзи",
            "p.m1": "Весенняя классика",
            "p.m2": "Мужской повседневный стиль",
            "p.m3": "Мужской классический стиль",
            "p.w1": "Зелёный жакет",
            "p.w2": "Классическое платье",
            "p.w3": "Весенняя коллекция",
            "p.k1": "Школьная коллекция",
            "p.k2": "Летняя коллекция",
            "p.k3": "Детский классический стиль",

            // Why us
            "why.eyebrow": "Почему ATOYA",
            "why.title": "Почему выбирают именно нас?",
            "why.text": "Мы — команда специалистов с многолетним опытом в области штор и интерьерных решений. Подходим к каждому проекту индивидуально и предлагаем качественные современные решения с учётом вкуса и потребностей клиента, а также особенностей квартиры или объекта.",
            "why.quote": "На протяжении многих лет мы сотрудничаем не только с частными домами, но и с крупными офисами, многоэтажными жилыми комплексами, банкетными залами, ресторанами, гостиницами, больницами и другими крупными объектами.",
            "why.p1": "Для нас важен не только красивый внешний вид, но и качество, точность и долговечность. Каждый этап — от выбора штор до замера, пошива и установки — мы выполняем профессионально.",
            "why.p2": "Клиенты выбирают нас за опыт, качественную работу, ответственный подход и надёжность. Каждый выполненный проект — ещё одно подтверждение нашего опыта и качества работы.",
            "why.box1.title": "Многолетний опыт",
            "why.box1.sub": "Гарантия высокого качества",
            "why.box2.title": "Профессиональная команда",
            "why.box2.sub": "Современный дизайн",
            "alt.why1": "Шторы для больницы",
            "alt.why2": "Шторы в современном интерьере",

            // Gallery
            "gallery.eyebrow": "Наши работы",
            "gallery.title": "Качество и доверие",
            "gallery.text": "Многолетний опыт, квалифицированные специалисты и десятки реализованных крупных проектов — наше главное преимущество. Мы предлагаем качественные и надёжные решения — от квартир до крупных коммерческих объектов.",
            "gallery.cta": "Подписаться в Instagram",
            "gallery.aria": "Смотреть в Instagram",
            "alt.g1": "Нарядное платье",
            "alt.g2": "Шторы для гостиной",
            "alt.g3": "Женская одежда",
            "alt.g4": "Шторы для зала ресторана",
            "alt.g5": "Оформление банкетного зала",
            "alt.g6": "Шторы для гостиной комнаты",

            // CTA & forms
            "cta.eyebrow": "Бесплатная консультация",
            "cta.title": "ATOYA — профессиональный партнёр для крупных проектов",
            "cta.text": "Многолетний опыт, квалифицированные специалисты и опыт, накопленный на крупных проектах, позволяют нам профессионально выполнять заказы любого объёма. Мы предлагаем комплексные решения по шторам — от квартир до офисов, ресторанов, банкетных залов, гостиниц и других крупных объектов.",
            "form.name": "Ваше имя",
            "form.phone": "Ваш номер телефона",
            "form.message": "Ваше сообщение",
            "form.submit": "Отправить",
            "info.address": "Адрес:",
            "info.addressVal": "Зангиатинский район, улица Амира Темура, дом 217",
            "info.phone": "Для связи:",
            "info.landmark": "Ориентир:",
            "info.landmarkVal": "Мечеть Зангиата",
            "info.hours": "Часы работы:",
            "info.email": "Email:",
            "info.social": "Соцсети:",

            // Footer
            "footer.tagline": "Премиальные шторы и интерьерные решения",
            "footer.address": "Ташкентская область, Зангиатинский район, улица Амира Темура, дом 217",
            "footer.catalog": "Каталог",
            "footer.curtains": "Шторы",
            "footer.clothing": "Коллекция одежды",
            "footer.blinds": "Жалюзи",
            "footer.pages": "Страницы",
            "footer.home": "Главная",
            "footer.about": "О нас",
            "footer.info": "Получить информацию",
            "footer.contact": "Связаться с нами",
            "footer.help": "Помощь и информация",
            "footer.appeal": "Оставить обращение",
            "footer.faq": "Часто задаваемые вопросы",
            "footer.delivery": "Доставка",
            "footer.orderInfo": "Информация о заказе",
            "footer.copy": "© 2026 ATOYA. Все права защищены.",

            // About page
            "about.eyebrow": "ATOYA",
            "about.heading": "О нашей компании",
            "about.headingSub": "Современные решения для штор и интерьера",
            "about.eyebrow2": "О нас",
            "about.title": "О нас и нашем мастерстве",
            "about.text": "ATOYA — команда специалистов с многолетним опытом в области штор, жалюзи и интерьерных решений. Мы подходим к каждому проекту индивидуально и учитываем вкус и потребности клиента.",
            "about.p": "Каждый этап — от выбора штор до замера, пошива и установки — мы выполняем профессионально. Для нас важны не только красота, но и качество, точность и долговечность.",
            "pros.eyebrow": "Наш сервис",
            "pros.title": "Профессиональные специалисты",
            "pros.text": "В ATOYA работают настоящие мастера своего дела. Мы подходим к каждому заказу индивидуально и предлагаем решение, которое соответствует пожеланиям клиента.",
            "pros.s1": "Профессиональная консультация",
            "pros.s1d": "Мастера своего дела помогут подобрать подходящее решение.",
            "pros.s2": "Точный замер",
            "pros.s2d": "Удобный для клиента и точный замер.",
            "pros.s3": "Индивидуальный пошив",
            "pros.s3d": "Каждый заказ выполняется в соответствии с пожеланиями клиента.",
            "pros.s4": "Доставка",
            "pros.s4d": "Доставим готовое изделие удобным для вас способом.",
            "pros.s5": "Профессиональная установка",
            "pros.s5d": "Устанавливаем качественно и ответственно.",
            "pros.free": "Бесплатно",
            "pros.bannerTitle": "Бесплатный замер и установка",
            "pros.bannerText": "Замер и профессиональная установка — совершенно бесплатно.",
            "services.eyebrow": "Услуги",
            "services.title": "Наши услуги",
            "services.text": "От выбора штор до установки — всё в одном месте.",
            "services.s1": "Индивидуальный пошив",
            "services.s1d": "Шьём шторы из качественных тканей точно по размерам вашего помещения и в стиле вашего интерьера.",
            "services.s2": "Замер и консультация",
            "services.s2d": "Наш специалист выполнит замер и поможет подобрать ткань, цвет и модель.",
            "services.s3": "Решения для крупных объектов",
            "services.s3d": "Комплексные услуги по шторам для офисов, ресторанов, банкетных залов, гостиниц и больниц.",

            // Products page
            "products.eyebrow": "Каталог",
            "products.heading": "Познакомьтесь с нашей продукцией",
            "products.headingSub": "Коллекции штор, жалюзи и одежды",
            "products.title": "Наши новинки",
            "products.text": "Ознакомьтесь со всеми нашими коллекциями.",
            "filter.all": "Все",
            "filter.label": "Фильтр по категориям",

            // Single product page
            "single.eyebrow": "О товаре",
            "single.headingSub": "Шьются индивидуально по размерам вашего помещения",
            "single.price": "Цена: договорная, зависит от размера и ткани",
            "single.desc": "Шторы блэкаут задерживают солнечный свет и создают в комнате комфорт и приватность. Отличное решение для спальни, детской, офиса и гостиниц.",
            "single.quote": "Каждая штора шьётся индивидуально по размерам вашего помещения.",
            "single.f1": "Пошив по индивидуальным размерам",
            "single.f2": "Большой выбор цветов и тканей",
            "single.f3": "Профессиональный замер и установка",
            "single.qty": "Количество окон",
            "single.img1": "Изображение 1",
            "single.img2": "Изображение 2",
            "single.img3": "Изображение 3",
            "single.img4": "Изображение 4",
            "single.minus": "Уменьшить",
            "single.plus": "Увеличить",

            // Contact page
            "contact.eyebrow": "Контакты",
            "contact.headingSub": "Если у вас есть вопросы или нужна консультация — мы всегда на связи.",
            "contact.formEyebrow": "Обращение",
            "contact.title": "Есть вопрос? Напишите нам!",
            "contact.text": "Оставьте свои данные — наши специалисты свяжутся с вами и ответят на все вопросы.",
            "contact.mapTitle": "ATOYA на карте"
        },

        en: {
            "form.note": "Thank you! For now, requests are accepted by phone: +998 (99) 309-58-00",
            "owl.prev": "Previous",
            "owl.next": "Next",

            // Catalog & product gallery
            "cat.curtain": "Curtain design",
            "soon.title": "Coming Soon",
            "soon.lead": "We are currently working on a new collection.",
            "soon.text": "New pieces will be available very soon — stay tuned for updates.",
            "soon.back": "Explore other collections",
            "cat.outfit": "Women's outfit",
            "p.pillows": "Decorative pillows",
            "p.tabledecor": "Banquet table decor",
            "catalog.more": "Show more",
            "catalog.photos": "photos",
            "pm.photo": "Photo",
            "pm.view": "View photos",
            "pm.close": "Close",

            // Meta
            "meta.index.title": "ATOYA — Curtains & Interior Solutions | Tashkent",
            "meta.index.desc": "ATOYA — modern curtain and interior solutions in Tashkent. Quality curtains, professional tailoring and installation for homes, offices, restaurants, hotels and large venues.",
            "meta.about.title": "About Us — ATOYA | Curtains & Interior Solutions",
            "meta.about.desc": "About ATOYA: a team of specialists with many years of experience in curtains, blinds and interior solutions. Measuring, tailoring and installation.",
            "meta.products.title": "Catalog — ATOYA | Curtains, Blinds & Clothing",
            "meta.products.desc": "ATOYA catalog: curtains, blinds and women's, men's and children's clothing collections. Custom orders and professional installation.",
            "meta.single.title": "Blackout Curtains — ATOYA",
            "meta.single.desc": "Blackout curtains by ATOYA. Modern light-blocking curtains tailored to the exact size of your room. Measuring and installation service.",
            "meta.contact.title": "Contact — ATOYA | Curtains & Interior Solutions",
            "meta.contact.desc": "Contact ATOYA: +998 (99) 309-58-00. Address: 217 Amir Temur Street, Zangiota District, Tashkent Region. Working hours: 08:00 - 20:00.",

            // Accessibility & header
            "a11y.skip": "Skip to main content",
            "a11y.phone": "Phone",
            "brand.home": "ATOYA — home page",
            "nav.toggle": "Open menu",
            "nav.main": "Main menu",
            "lang.label": "Choose language",
            "nav.home": "Home",
            "nav.curtains": "Curtains",
            "nav.clothing": "Elegant clothing",
            "nav.blinds": "Blinds",
            "nav.pages": "Pages",
            "nav.about": "About us",
            "nav.products": "Products",
            "nav.single": "Product page",
            "nav.contact": "Contact us",

            // Hero
            "hero.eyebrow": "Curtains & interior solutions · Tashkent",
            "hero.title": "More than curtains — the character of your space",
            "hero.text": "Curtains crafted in harmony of taste, quality and skill",
            "hero.cta": "Free consultation!",
            "hero.call": "Call us",
            "hero.alt": "ATOYA modern curtains and interior solutions",
            "tile1.title": "Elegant clothing collection",
            "tile1.sub": "A unique style for women, girls and brides",
            "tile1.htitle": "For women and girls",
            "tile1.text": "Everyday, festive and special-occasion clothing in a modern, elegant style.",
            "tile2.title": "Men's collection",
            "tile2.sub": "Where classic meets modern",
            "tile2.htitle": "For men",
            "tile2.text": "Masculine style, modern taste.",
            "tile3.title": "Kids' collection",
            "tile3.sub": "A special style for every moment of childhood",
            "tile3.text": "A unique style for every little one.",
            "tile4.title": "Blinds",
            "tile4.sub": "Quality blinds for your home or office",
            "tile4.htitle": "Modern blinds",
            "tile4.text": "A modern way to control light and add elegance to your interior.",
            "btn.more": "Learn more",
            "btn.soon": "Coming soon!",

            // Product sections
            "men.eyebrow": "Curtains",
            "men.title": "The elegance collection",
            "men.text": "Modern curtains, curtain tailoring and custom orders in Tashkent. Quality interior solutions for homes, offices, restaurants, hotels and large venues.",
            "women.eyebrow": "Elegant clothing",
            "women.title": "Clothing collection",
            "women.text": "Clothing that reflects modern style and elegance.",
            "kids.eyebrow": "Blinds",
            "kids.title": "Blinds — a harmony of light and elegance",
            "kids.text": "Modern blinds are designed to control sunlight, provide privacy and make your interior even more elegant.",
            "tag.curtains": "Curtains",
            "tag.clothing": "Clothing",
            "tag.blinds": "Blinds",
            "tag.women": "Women",
            "tag.men": "Men",
            "tag.kids": "Kids",
            "card.order": "Order now",
            "card.zoom": "Enlarge image",
            "card.price": "Price on request",
            "p.blackout": "Blackout curtains",
            "p.classic": "Classic curtains",
            "p.theatre": "Theatre-style curtains",
            "p.luversak": "Grommet curtains",
            "p.festive": "Festive dresses",
            "p.bridal": "Bridal dresses",
            "p.girls": "Dresses for girls",
            "p.horizontal": "Horizontal blinds",
            "p.roman": "Roman blinds",
            "p.roller": "Roller blinds",
            "p.vertical": "Vertical blinds",
            "p.m1": "Spring classic",
            "p.m2": "Men's casual style",
            "p.m3": "Men's classic style",
            "p.w1": "Green jacket",
            "p.w2": "Classic dress",
            "p.w3": "Spring collection",
            "p.k1": "School collection",
            "p.k2": "Summer collection",
            "p.k3": "Kids' classic style",

            // Why us
            "why.eyebrow": "Why ATOYA",
            "why.title": "Why do clients choose us?",
            "why.text": "We are a team of specialists with many years of experience in curtain and interior solutions. We take an individual approach to every project and offer quality, modern solutions that reflect the client's taste and needs as well as the specifics of each home or venue.",
            "why.quote": "Over the years we have worked not only with private homes but also with large offices, apartment complexes, wedding halls, restaurants, hotels, hospitals and other large venues.",
            "why.p1": "For us, it is not only about beautiful looks — quality, precision and durability matter just as much. We handle every stage professionally, from choosing the curtains to measuring, tailoring and installation.",
            "why.p2": "Clients choose us for our experience, quality work, responsible approach and reliability. Every completed project is further proof of our expertise and the quality of our work.",
            "why.box1.title": "Years of experience",
            "why.box1.sub": "Guaranteed high quality",
            "why.box2.title": "Professional team",
            "why.box2.sub": "Modern design",
            "alt.why1": "Curtains for a hospital",
            "alt.why2": "Curtains in a modern interior",

            // Gallery
            "gallery.eyebrow": "Our work",
            "gallery.title": "Quality and trust",
            "gallery.text": "Years of experience, skilled specialists and dozens of completed large projects are our main strengths. We deliver quality, reliable solutions — from private homes to large commercial venues.",
            "gallery.cta": "Follow us on Instagram",
            "gallery.aria": "View on Instagram",
            "alt.g1": "Elegant dress",
            "alt.g2": "Curtains for a living room",
            "alt.g3": "Women's clothing",
            "alt.g4": "Curtains for a restaurant hall",
            "alt.g5": "Banquet hall decor",
            "alt.g6": "Curtains for a guest room",

            // CTA & forms
            "cta.eyebrow": "Free consultation",
            "cta.title": "ATOYA — a professional partner for large projects",
            "cta.text": "Years of experience, skilled specialists and expertise gained on large projects allow us to complete orders of any size to a professional standard. We provide complete curtain solutions — from homes to offices, restaurants, wedding halls, hotels and other large venues.",
            "form.name": "Your name",
            "form.phone": "Your phone number",
            "form.message": "Your message",
            "form.submit": "Send",
            "info.address": "Address:",
            "info.addressVal": "217 Amir Temur Street, Zangiota District",
            "info.phone": "Contact:",
            "info.landmark": "Landmark:",
            "info.landmarkVal": "Zangiota Mosque",
            "info.hours": "Working hours:",
            "info.email": "Email:",
            "info.social": "Social media:",

            // Footer
            "footer.tagline": "Premium curtains & interior solutions",
            "footer.address": "217 Amir Temur Street, Zangiota District, Tashkent Region",
            "footer.catalog": "Catalog",
            "footer.curtains": "Curtains",
            "footer.clothing": "Clothing collection",
            "footer.blinds": "Blinds",
            "footer.pages": "Pages",
            "footer.home": "Home",
            "footer.about": "About us",
            "footer.info": "Get information",
            "footer.contact": "Contact us",
            "footer.help": "Help & information",
            "footer.appeal": "Send a request",
            "footer.faq": "Frequently asked questions",
            "footer.delivery": "Delivery",
            "footer.orderInfo": "Order information",
            "footer.copy": "© 2026 ATOYA. All rights reserved.",

            // About page
            "about.eyebrow": "ATOYA",
            "about.heading": "About our company",
            "about.headingSub": "Modern solutions for curtains and interiors",
            "about.eyebrow2": "About us",
            "about.title": "About us and our craft",
            "about.text": "ATOYA is a team of specialists with many years of experience in curtains, blinds and interior solutions. We take an individual approach to every project and consider each client's taste and needs.",
            "about.p": "We handle every stage professionally — from choosing the curtains to measuring, tailoring and installation. Beyond beautiful looks, quality, precision and durability matter to us.",
            "pros.eyebrow": "Our service",
            "pros.title": "Professional specialists",
            "pros.text": "At ATOYA, true masters of their craft take care of your order. We approach every order individually and offer a solution that matches the client’s wishes.",
            "pros.s1": "Professional consultation",
            "pros.s1d": "Skilled specialists help you choose the right solution.",
            "pros.s2": "Accurate measurements",
            "pros.s2d": "A convenient and precise measuring service for every client.",
            "pros.s3": "Custom sewing",
            "pros.s3d": "Every order is made individually to match the client’s wishes.",
            "pros.s4": "Delivery",
            "pros.s4d": "We deliver the finished product to you in a convenient way.",
            "pros.s5": "Professional installation",
            "pros.s5d": "Careful, responsible and high-quality installation.",
            "pros.free": "Free",
            "pros.bannerTitle": "Free measurement and installation",
            "pros.bannerText": "Measuring and professional installation are completely free of charge.",
            "services.eyebrow": "Services",
            "services.title": "Our services",
            "services.text": "From choosing curtains to installation — everything in one place.",
            "services.s1": "Custom tailoring",
            "services.s1d": "We tailor curtains from quality fabrics to fit the size of your room and the style of your interior.",
            "services.s2": "Measuring & consultation",
            "services.s2d": "Our specialist takes measurements and helps you choose the fabric, color and style.",
            "services.s3": "Solutions for large venues",
            "services.s3d": "Complete curtain services for offices, restaurants, wedding halls, hotels and hospitals.",

            // Products page
            "products.eyebrow": "Catalog",
            "products.heading": "Discover our products",
            "products.headingSub": "Curtain, blind and clothing collections",
            "products.title": "Our latest products",
            "products.text": "Explore all of our collections.",
            "filter.all": "All",
            "filter.label": "Filter by category",

            // Single product page
            "single.eyebrow": "Product details",
            "single.headingSub": "Tailored individually to the size of your room",
            "single.price": "Price: on request, depending on size and fabric",
            "single.desc": "Blackout curtains block sunlight and bring comfort and privacy to your room. A great choice for bedrooms, children's rooms, offices and hotels.",
            "single.quote": "Every curtain is tailored individually to fit your room.",
            "single.f1": "Tailored to your exact measurements",
            "single.f2": "Wide choice of colors and fabrics",
            "single.f3": "Professional measuring and installation",
            "single.qty": "Number of windows",
            "single.img1": "Image 1",
            "single.img2": "Image 2",
            "single.img3": "Image 3",
            "single.img4": "Image 4",
            "single.minus": "Decrease",
            "single.plus": "Increase",

            // Contact page
            "contact.eyebrow": "Contact",
            "contact.headingSub": "If you have questions or need a consultation, we are always here for you.",
            "contact.formEyebrow": "Get in touch",
            "contact.title": "Have a question? Write to us!",
            "contact.text": "Leave your details and our specialists will contact you and answer your questions.",
            "contact.mapTitle": "ATOYA on the map"
        }
    };

    var current = "uz";

    function rememberOriginals(root) {
        var nodes = (root || document).querySelectorAll("[data-i18n]");
        for (var i = 0; i < nodes.length; i++) {
            if (!nodes[i].hasAttribute("data-i18n-uz")) {
                nodes[i].setAttribute("data-i18n-uz", nodes[i].innerHTML);
            }
        }
        var attrNodes = (root || document).querySelectorAll("[data-i18n-attr]");
        for (var j = 0; j < attrNodes.length; j++) {
            eachAttr(attrNodes[j], function (el, attr) {
                var store = "data-i18n-uz-" + attr;
                if (!el.hasAttribute(store)) {
                    el.setAttribute(store, el.getAttribute(attr) || "");
                }
            });
        }
    }

    function eachAttr(el, fn) {
        var pairs = el.getAttribute("data-i18n-attr").split(";");
        for (var k = 0; k < pairs.length; k++) {
            var parts = pairs[k].split(":");
            if (parts.length === 2) {
                fn(el, parts[0].trim(), parts[1].trim());
            }
        }
    }

    function lookup(key, lang) {
        return dict[lang] && Object.prototype.hasOwnProperty.call(dict[lang], key) ? dict[lang][key] : null;
    }

    function apply(lang) {
        if (LANGS.indexOf(lang) === -1) {
            lang = "uz";
        }
        current = lang;
        rememberOriginals();

        var nodes = document.querySelectorAll("[data-i18n]");
        for (var i = 0; i < nodes.length; i++) {
            var el = nodes[i];
            var text = lang === "uz" ? null : lookup(el.getAttribute("data-i18n"), lang);
            el.innerHTML = text !== null ? text : el.getAttribute("data-i18n-uz");
        }

        var attrNodes = document.querySelectorAll("[data-i18n-attr]");
        for (var j = 0; j < attrNodes.length; j++) {
            eachAttr(attrNodes[j], function (node, attr, key) {
                var value = lang === "uz" ? null : lookup(key, lang);
                node.setAttribute(attr, value !== null ? value : node.getAttribute("data-i18n-uz-" + attr));
            });
        }

        document.documentElement.setAttribute("lang", lang);

        var buttons = document.querySelectorAll(".lang-btn");
        for (var b = 0; b < buttons.length; b++) {
            buttons[b].setAttribute("aria-pressed", buttons[b].getAttribute("data-lang") === lang ? "true" : "false");
        }

        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch (e) { /* storage may be unavailable (private mode) */ }

        // Let scripts that render text themselves (e.g. the catalog) re-render
        var event;
        try {
            event = new CustomEvent("atoya:langchange", { detail: { lang: lang } });
        } catch (e) {
            event = document.createEvent("CustomEvent");
            event.initCustomEvent("atoya:langchange", false, false, { lang: lang });
        }
        document.dispatchEvent(event);
    }

    function initialLang() {
        var match = /[?&]lang=(uz|ru|en)\b/.exec(window.location.search);
        if (match) {
            return match[1];
        }
        try {
            var saved = localStorage.getItem(STORAGE_KEY);
            if (LANGS.indexOf(saved) !== -1) {
                return saved;
            }
        } catch (e) { /* ignore */ }
        return "uz";
    }

    document.addEventListener("click", function (event) {
        var target = event.target;
        while (target && target !== document) {
            if (target.classList && target.classList.contains("lang-btn")) {
                apply(target.getAttribute("data-lang"));
                return;
            }
            target = target.parentNode;
        }
    });

    window.ATOYA_I18N = {
        apply: apply,
        current: function () { return current; },
        // Translate a key from JavaScript (falls back to Uzbek, then to the key itself)
        t: function (key) {
            var value = lookup(key, current) || lookup(key, "uz");
            if (value) {
                return value;
            }
            // Last resort: the Uzbek original of an element on this page that uses the key
            var el = document.querySelector('[data-i18n="' + key + '"]');
            return el ? el.getAttribute("data-i18n-uz").replace(/<[^>]*>/g, "") : key;
        },
        // Re-run after adding new translatable elements to the page
        refresh: function () { apply(current); }
    };

    // Scripts are loaded at the end of <body>, so the DOM is ready here.
    rememberOriginals();
    apply(initialLang());
})();
