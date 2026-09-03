export type SupportedLocale = 'es-mx' | 'es-es' | 'en-us' | 'ja-jp' | 'pt-br' | 'fr-fr' | 'de-de' | 'ko-kr' | 'zh-cn'
export type LocalePreference = 'auto' | SupportedLocale

export const localeChoices: Array<{ id: SupportedLocale; name: string }> = [
  { id: 'es-mx', name: 'Español (Latinoamérica)' },
  { id: 'es-es', name: 'Español (España)' },
  { id: 'en-us', name: 'English (US)' },
  { id: 'ja-jp', name: '日本語' },
  { id: 'pt-br', name: 'Português (Brasil)' },
  { id: 'fr-fr', name: 'Français' },
  { id: 'de-de', name: 'Deutsch' },
  { id: 'ko-kr', name: '한국어' },
  { id: 'zh-cn', name: '简体中文' },
]

type CopyKey =
  | 'random_picker'
  | 'nav_home'
  | 'nav_roulette'
  | 'nav_profiles'
  | 'nav_more'
  | 'settings_kicker'
  | 'settings_title'
  | 'settings_intro'
  | 'catalog_active'
  | 'profiles'
  | 'stored'
  | 'tab_general'
  | 'tab_general_desc'
  | 'tab_audio'
  | 'tab_audio_desc'
  | 'tab_games'
  | 'tab_games_desc'
  | 'tab_language'
  | 'tab_language_desc'
  | 'tab_credits'
  | 'tab_credits_desc'
  | 'active_section'
  | 'language_eyebrow'
  | 'language_title'
  | 'language_intro'
  | 'language_auto_title'
  | 'language_auto_body'
  | 'language_detected'
  | 'language_manual_title'
  | 'language_manual_body'
  | 'language_active'
  | 'language_saved'
  | 'credits_kicker'
  | 'credits_title'
  | 'credits_intro'
  | 'credits_play'
  | 'credits_project'
  | 'credits_hammond_alt'
  | 'credits_hammond_hint'
  | 'credits_author_label'
  | 'credits_author_body'
  | 'credits_community_label'
  | 'credits_community_title'
  | 'credits_community_body'
  | 'credits_idea'
  | 'credits_manifest'
  | 'credits_legal_title'
  | 'credits_legal_body'
  | 'credits_thanks'

const esMx: Record<CopyKey, string> = {
  random_picker: 'Selector aleatorio de héroes',
  nav_home: 'Principal',
  nav_roulette: 'Ruleta',
  nav_profiles: 'Perfiles',
  nav_more: 'Más',
  settings_kicker: 'Preferencias de OverRoll',
  settings_title: 'Configuración',
  settings_intro: 'Abre una categoría para modificar únicamente ese apartado, sin mezclar opciones ni obligarte a recorrer toda la página.',
  catalog_active: 'Catálogo activo',
  profiles: 'Perfiles',
  stored: 'Almacenado',
  tab_general: 'General',
  tab_general_desc: 'Interfaz, rendimiento y experiencia de uso.',
  tab_audio: 'Audio',
  tab_audio_desc: 'Volumen y sonidos de interacción.',
  tab_games: 'Juegos',
  tab_games_desc: 'Catálogos y acceso directo a cada módulo.',
  tab_language: 'Idioma',
  tab_language_desc: 'Detección del navegador y preferencia de la interfaz.',
  tab_credits: 'Créditos',
  tab_credits_desc: 'Origen, comunidad y esencia de OverRoll.',
  active_section: 'APARTADO ACTIVO',
  language_eyebrow: 'IDIOMA Y REGIÓN',
  language_title: 'Elige cómo habla OverRoll',
  language_intro: 'En automático se usa el idioma preferido del navegador. Una selección manual se guarda solo en este dispositivo.',
  language_auto_title: 'Seguir el idioma del navegador',
  language_auto_body: 'OverRoll revisa navigator.languages y elige la coincidencia compatible más cercana.',
  language_detected: 'Detectado',
  language_manual_title: 'Elegir manualmente',
  language_manual_body: 'Esta opción tiene prioridad sobre el navegador hasta que vuelvas a Automático.',
  language_active: 'Idioma activo',
  language_saved: 'La preferencia se guarda en este navegador.',
  credits_kicker: 'OVERROLL · PROYECTO FAN',
  credits_title: 'Lo que salga, se juega.',
  credits_intro: 'OverRoll deja la elección en manos del azar: arma el equipo, gira la ruleta y entra a la partida con lo que te toque.',
  credits_play: 'Volver a jugar',
  credits_project: 'Ver proyecto',
  credits_hammond_alt: 'Hammond bailando',
  credits_hammond_hint: 'Abrir la canción del baile de Hammond',
  credits_author_label: 'CREADO Y DIRIGIDO POR',
  credits_author_body: 'Concepto original, identidad visual, diseño funcional, decisiones del producto y evolución de OverRoll.',
  credits_community_label: 'CON LA AYUDA DE',
  credits_community_title: 'LA COMUNIDAD DE OVERROLL',
  credits_community_body: 'Quienes probaron cada versión, reportaron errores y ayudaron a convertir una idea de retas entre amigos en una herramienta para todos.',
  credits_idea: 'NUESTRA IDEA',
  credits_manifest: 'Gira. Acepta lo que salga. Juega.',
  credits_legal_title: 'OverRoll es gratuito, fan-made y no oficial.',
  credits_legal_body: 'Las marcas, personajes, imágenes y nombres pertenecen a sus respectivos propietarios. OverRoll no está afiliado ni respaldado por sus compañías.',
  credits_thanks: 'GRACIAS POR JUGAR',
}

const translations: Partial<Record<SupportedLocale, Partial<Record<CopyKey, string>>>> = {
  'zh-cn': {
    random_picker: '随机英雄选择器', nav_home: '主页', nav_roulette: '轮盘', nav_profiles: '配置档', nav_more: '更多', settings_kicker: 'OverRoll 设置', settings_title: '设置', settings_intro: '打开一个分类，只修改该部分，不必混合选项或滚动整个页面。', catalog_active: '当前目录', profiles: '配置档', stored: '已保存', tab_general: '常规', tab_general_desc: '界面、性能与使用体验。', tab_audio: '音频', tab_audio_desc: '音量与交互音效。', tab_games: '游戏', tab_games_desc: '各模块的目录和快捷入口。', tab_language: '语言', tab_language_desc: '浏览器检测与界面语言偏好。', tab_credits: '制作人员', tab_credits_desc: 'OverRoll 的起源、社区与理念。', active_section: '当前分类', language_eyebrow: '语言与地区', language_title: '选择 OverRoll 的显示语言', language_intro: '自动模式会跟随浏览器首选语言。手动选择只保存在此设备。', language_auto_title: '跟随浏览器语言', language_auto_body: 'OverRoll 会检查 navigator.languages，并选择最接近的受支持语言。', language_detected: '检测到', language_manual_title: '手动选择', language_manual_body: '在切回自动模式之前，此选择优先于浏览器。', language_active: '当前语言', language_saved: '偏好已保存在此浏览器。', credits_kicker: 'OVERROLL · 粉丝项目', credits_title: '抽到什么就玩什么。', credits_intro: 'OverRoll 把选择交给随机：生成队伍、转动轮盘，然后用抽到的结果进入对局。', credits_play: '返回游戏', credits_project: '查看项目', credits_hammond_alt: 'Hammond 跳舞', credits_hammond_hint: '打开 Hammond 的舞蹈歌曲', credits_author_label: '创作与主导', credits_author_body: '原创概念、视觉形象、功能设计、产品决策以及 OverRoll 的持续发展。', credits_community_label: '特别感谢', credits_community_title: 'OVERROLL 社区', credits_community_body: '感谢所有测试版本、报告错误，并把朋友间的点子变成所有人都能使用的工具的人。', credits_idea: '我们的想法', credits_manifest: '转动。接受结果。开玩。', credits_legal_title: 'OverRoll 是免费、非官方的粉丝项目。', credits_legal_body: '商标、角色、图片和名称归各自权利方所有。OverRoll 与相关公司没有隶属或授权关系。', credits_thanks: '感谢游玩',
  },
  'es-es': {
    random_picker: 'Selector aleatorio de héroes', nav_home: 'Principal', nav_roulette: 'Ruleta', nav_profiles: 'Perfiles', nav_more: 'Más',
    settings_kicker: 'Preferencias de OverRoll', settings_title: 'Configuración', settings_intro: 'Abre una categoría para modificar solo ese apartado, sin mezclar opciones ni recorrer toda la página.',
    catalog_active: 'Catálogo activo', profiles: 'Perfiles', stored: 'Almacenado', tab_general: 'General', tab_general_desc: 'Interfaz, rendimiento y experiencia de uso.', tab_audio: 'Audio', tab_audio_desc: 'Volumen y sonidos de interacción.', tab_games: 'Juegos', tab_games_desc: 'Catálogos y acceso directo a cada módulo.', tab_language: 'Idioma', tab_language_desc: 'Detección del navegador y preferencia de la interfaz.', tab_credits: 'Créditos', tab_credits_desc: 'Origen, comunidad y esencia de OverRoll.', active_section: 'APARTADO ACTIVO',
    language_eyebrow: 'IDIOMA Y REGIÓN', language_title: 'Elige cómo habla OverRoll', language_intro: 'En automático se usa el idioma preferido del navegador. Una selección manual se guarda solo en este dispositivo.', language_auto_title: 'Seguir el idioma del navegador', language_auto_body: 'OverRoll revisa navigator.languages y elige la coincidencia compatible más cercana.', language_detected: 'Detectado', language_manual_title: 'Elegir manualmente', language_manual_body: 'Esta opción tiene prioridad sobre el navegador hasta que vuelvas a Automático.', language_active: 'Idioma activo', language_saved: 'La preferencia se guarda en este navegador.',
    credits_kicker: 'OVERROLL · PROYECTO FAN', credits_title: 'Lo que salga, se juega.', credits_intro: 'OverRoll deja la elección en manos del azar: prepara el equipo, gira la ruleta y entra en la partida con lo que te toque.', credits_play: 'Volver a jugar', credits_project: 'Ver proyecto', credits_hammond_alt: 'Hammond bailando', credits_hammond_hint: 'Abrir la canción del baile de Hammond', credits_author_label: 'CREADO Y DIRIGIDO POR', credits_author_body: 'Concepto original, identidad visual, diseño funcional, decisiones de producto y evolución de OverRoll.', credits_community_label: 'CON LA AYUDA DE', credits_community_title: 'LA COMUNIDAD DE OVERROLL', credits_community_body: 'Quienes probaron cada versión, notificaron errores y ayudaron a convertir una idea de partidas entre amigos en una herramienta para todos.', credits_idea: 'NUESTRA IDEA', credits_manifest: 'Gira. Acepta lo que salga. Juega.', credits_legal_title: 'OverRoll es gratuito, fan-made y no oficial.', credits_legal_body: 'Las marcas, personajes, imágenes y nombres pertenecen a sus respectivos propietarios. OverRoll no está afiliado ni respaldado por sus compañías.', credits_thanks: 'GRACIAS POR JUGAR',
  },
  'en-us': {
    random_picker: 'Random Hero Picker', nav_home: 'Home', nav_roulette: 'Roulette', nav_profiles: 'Profiles', nav_more: 'More',
    settings_kicker: 'OverRoll preferences', settings_title: 'Settings', settings_intro: 'Open a category to change only that section without mixing options or scrolling through the entire page.',
    catalog_active: 'Active catalog', profiles: 'Profiles', stored: 'Stored', tab_general: 'General', tab_general_desc: 'Interface, performance and user experience.', tab_audio: 'Audio', tab_audio_desc: 'Volume and interaction sounds.', tab_games: 'Games', tab_games_desc: 'Catalogs and shortcuts to every module.', tab_language: 'Language', tab_language_desc: 'Browser detection and interface preference.', tab_credits: 'Credits', tab_credits_desc: 'The origin, community and spirit of OverRoll.', active_section: 'ACTIVE SECTION',
    language_eyebrow: 'LANGUAGE AND REGION', language_title: 'Choose how OverRoll speaks', language_intro: 'Automatic mode follows the browser’s preferred language. A manual choice is stored only on this device.', language_auto_title: 'Follow browser language', language_auto_body: 'OverRoll checks navigator.languages and chooses the closest supported match.', language_detected: 'Detected', language_manual_title: 'Choose manually', language_manual_body: 'This choice overrides the browser until you switch back to Automatic.', language_active: 'Active language', language_saved: 'Your preference is saved in this browser.',
    credits_kicker: 'OVERROLL · FAN PROJECT', credits_title: 'Play what you get.', credits_intro: 'OverRoll leaves the choice to chance: build the team, spin the wheel and enter the match with whatever comes up.', credits_play: 'Back to playing', credits_project: 'View project', credits_hammond_alt: 'Hammond dancing', credits_hammond_hint: 'Open Hammond’s dance song', credits_author_label: 'CREATED AND DIRECTED BY', credits_author_body: 'Original concept, visual identity, functional design, product decisions and the evolution of OverRoll.', credits_community_label: 'WITH HELP FROM', credits_community_title: 'THE OVERROLL COMMUNITY', credits_community_body: 'Everyone who tested each version, reported bugs and helped turn a friend-group idea into a tool for everyone.', credits_idea: 'OUR IDEA', credits_manifest: 'Spin. Accept what comes up. Play.', credits_legal_title: 'OverRoll is free, fan-made and unofficial.', credits_legal_body: 'Brands, characters, images and names belong to their respective owners. OverRoll is not affiliated with or endorsed by their companies.', credits_thanks: 'THANKS FOR PLAYING',
  },
  'pt-br': {
    random_picker: 'Seletor aleatório de heróis', nav_home: 'Principal', nav_roulette: 'Roleta', nav_profiles: 'Perfis', nav_more: 'Mais', settings_kicker: 'Preferências do OverRoll', settings_title: 'Configurações', settings_intro: 'Abra uma categoria para alterar somente essa seção, sem misturar opções nem percorrer a página inteira.', catalog_active: 'Catálogo ativo', profiles: 'Perfis', stored: 'Armazenado', tab_general: 'Geral', tab_general_desc: 'Interface, desempenho e experiência de uso.', tab_audio: 'Áudio', tab_audio_desc: 'Volume e sons de interação.', tab_games: 'Jogos', tab_games_desc: 'Catálogos e atalhos para cada módulo.', tab_language: 'Idioma', tab_language_desc: 'Detecção do navegador e preferência da interface.', tab_credits: 'Créditos', tab_credits_desc: 'Origem, comunidade e essência do OverRoll.', active_section: 'SEÇÃO ATIVA', language_eyebrow: 'IDIOMA E REGIÃO', language_title: 'Escolha como o OverRoll fala', language_intro: 'No modo automático, usamos o idioma preferido do navegador. Uma escolha manual fica salva apenas neste dispositivo.', language_auto_title: 'Seguir o idioma do navegador', language_auto_body: 'O OverRoll verifica navigator.languages e escolhe a opção compatível mais próxima.', language_detected: 'Detectado', language_manual_title: 'Escolher manualmente', language_manual_body: 'Esta opção substitui o navegador até você voltar para Automático.', language_active: 'Idioma ativo', language_saved: 'A preferência fica salva neste navegador.', credits_kicker: 'OVERROLL · PROJETO DE FÃ', credits_title: 'Saiu, tem que jogar.', credits_intro: 'O OverRoll deixa a escolha nas mãos do acaso: monte a equipe, gire a roleta e entre na partida com o que cair.', credits_play: 'Voltar a jogar', credits_project: 'Ver projeto', credits_hammond_alt: 'Hammond dançando', credits_hammond_hint: 'Abrir a música da dança do Hammond', credits_author_label: 'CRIADO E DIRIGIDO POR', credits_author_body: 'Conceito original, identidade visual, design funcional, decisões de produto e evolução do OverRoll.', credits_community_label: 'COM A AJUDA DE', credits_community_title: 'A COMUNIDADE OVERROLL', credits_community_body: 'Quem testou cada versão, relatou erros e ajudou a transformar uma ideia entre amigos em uma ferramenta para todos.', credits_idea: 'NOSSA IDEIA', credits_manifest: 'Gire. Aceite o que cair. Jogue.', credits_legal_title: 'OverRoll é gratuito, fan-made e não oficial.', credits_legal_body: 'Marcas, personagens, imagens e nomes pertencem aos seus respectivos proprietários. OverRoll não é afiliado nem endossado por essas empresas.', credits_thanks: 'OBRIGADO POR JOGAR',
  },
  'fr-fr': {
    random_picker: 'Sélecteur aléatoire de héros', nav_home: 'Accueil', nav_roulette: 'Roulette', nav_profiles: 'Profils', nav_more: 'Plus', settings_kicker: 'Préférences OverRoll', settings_title: 'Paramètres', settings_intro: 'Ouvrez une catégorie pour ne modifier que cette section, sans mélanger les options ni parcourir toute la page.', catalog_active: 'Catalogue actif', profiles: 'Profils', stored: 'Stocké', tab_general: 'Général', tab_general_desc: 'Interface, performances et expérience utilisateur.', tab_audio: 'Audio', tab_audio_desc: 'Volume et sons d’interaction.', tab_games: 'Jeux', tab_games_desc: 'Catalogues et accès direct à chaque module.', tab_language: 'Langue', tab_language_desc: 'Détection du navigateur et préférence d’interface.', tab_credits: 'Crédits', tab_credits_desc: 'Origine, communauté et esprit d’OverRoll.', active_section: 'SECTION ACTIVE', language_eyebrow: 'LANGUE ET RÉGION', language_title: 'Choisissez la langue d’OverRoll', language_intro: 'Le mode automatique suit la langue préférée du navigateur. Un choix manuel est enregistré uniquement sur cet appareil.', language_auto_title: 'Suivre la langue du navigateur', language_auto_body: 'OverRoll consulte navigator.languages et choisit la correspondance prise en charge la plus proche.', language_detected: 'Détecté', language_manual_title: 'Choisir manuellement', language_manual_body: 'Ce choix remplace celui du navigateur jusqu’au retour au mode Automatique.', language_active: 'Langue active', language_saved: 'La préférence est enregistrée dans ce navigateur.', credits_kicker: 'OVERROLL · PROJET DE FAN', credits_title: 'On joue ce qui tombe.', credits_intro: 'OverRoll confie le choix au hasard : composez l’équipe, lancez la roulette et jouez ce qui sort.', credits_play: 'Revenir au jeu', credits_project: 'Voir le projet', credits_hammond_alt: 'Hammond danse', credits_hammond_hint: 'Ouvrir la chanson de la danse de Hammond', credits_author_label: 'CRÉÉ ET DIRIGÉ PAR', credits_author_body: 'Concept original, identité visuelle, conception fonctionnelle, décisions produit et évolution d’OverRoll.', credits_community_label: 'AVEC L’AIDE DE', credits_community_title: 'LA COMMUNAUTÉ OVERROLL', credits_community_body: 'Toutes les personnes qui ont testé les versions, signalé des bugs et transformé une idée entre amis en outil pour tous.', credits_idea: 'NOTRE IDÉE', credits_manifest: 'Tournez. Acceptez le résultat. Jouez.', credits_legal_title: 'OverRoll est gratuit, créé par des fans et non officiel.', credits_legal_body: 'Les marques, personnages, images et noms appartiennent à leurs propriétaires respectifs. OverRoll n’est ni affilié ni approuvé par leurs sociétés.', credits_thanks: 'MERCI D’AVOIR JOUÉ',
  },
  'de-de': {
    random_picker: 'Zufällige Heldenauswahl', nav_home: 'Start', nav_roulette: 'Roulette', nav_profiles: 'Profile', nav_more: 'Mehr', settings_kicker: 'OverRoll-Einstellungen', settings_title: 'Einstellungen', settings_intro: 'Öffne eine Kategorie, um nur diesen Bereich zu ändern, ohne Optionen zu vermischen oder die ganze Seite zu durchsuchen.', catalog_active: 'Aktiver Katalog', profiles: 'Profile', stored: 'Gespeichert', tab_general: 'Allgemein', tab_general_desc: 'Oberfläche, Leistung und Nutzungserlebnis.', tab_audio: 'Audio', tab_audio_desc: 'Lautstärke und Interaktionsklänge.', tab_games: 'Spiele', tab_games_desc: 'Kataloge und Direktzugriff auf jedes Modul.', tab_language: 'Sprache', tab_language_desc: 'Browsererkennung und Oberflächensprache.', tab_credits: 'Mitwirkende', tab_credits_desc: 'Ursprung, Community und Geist von OverRoll.', active_section: 'AKTIVER BEREICH', language_eyebrow: 'SPRACHE UND REGION', language_title: 'Wähle die Sprache von OverRoll', language_intro: 'Im Automatikmodus wird die bevorzugte Browsersprache verwendet. Eine manuelle Auswahl wird nur auf diesem Gerät gespeichert.', language_auto_title: 'Browsersprache verwenden', language_auto_body: 'OverRoll prüft navigator.languages und wählt die nächstgelegene unterstützte Sprache.', language_detected: 'Erkannt', language_manual_title: 'Manuell auswählen', language_manual_body: 'Diese Auswahl überschreibt den Browser, bis du wieder Automatisch wählst.', language_active: 'Aktive Sprache', language_saved: 'Die Auswahl wird in diesem Browser gespeichert.', credits_kicker: 'OVERROLL · FANPROJEKT', credits_title: 'Was kommt, wird gespielt.', credits_intro: 'OverRoll überlässt die Wahl dem Zufall: Team erstellen, Roulette drehen und mit dem Ergebnis ins Match gehen.', credits_play: 'Zurück zum Spielen', credits_project: 'Projekt ansehen', credits_hammond_alt: 'Hammond tanzt', credits_hammond_hint: 'Hammonds Tanzlied öffnen', credits_author_label: 'ERSTELLT UND GELEITET VON', credits_author_body: 'Originalkonzept, visuelle Identität, funktionales Design, Produktentscheidungen und Entwicklung von OverRoll.', credits_community_label: 'MIT HILFE VON', credits_community_title: 'DER OVERROLL-COMMUNITY', credits_community_body: 'Alle, die Versionen getestet, Fehler gemeldet und aus einer Freundesidee ein Werkzeug für alle gemacht haben.', credits_idea: 'UNSERE IDEE', credits_manifest: 'Drehen. Ergebnis annehmen. Spielen.', credits_legal_title: 'OverRoll ist kostenlos, fan-made und inoffiziell.', credits_legal_body: 'Marken, Figuren, Bilder und Namen gehören ihren jeweiligen Eigentümern. OverRoll ist nicht mit den Unternehmen verbunden oder von ihnen unterstützt.', credits_thanks: 'DANKE FÜRS SPIELEN',
  },
  'ja-jp': {
    random_picker: 'ランダムヒーローピッカー', nav_home: 'メイン', nav_roulette: 'ルーレット', nav_profiles: 'プロフィール', nav_more: 'その他', settings_kicker: 'OverRoll の設定', settings_title: '設定', settings_intro: 'カテゴリを開くと、その項目だけを変更できます。ページ全体を移動する必要はありません。', catalog_active: '現在のカタログ', profiles: 'プロフィール', stored: '保存データ', tab_general: '一般', tab_general_desc: '画面、性能、操作感。', tab_audio: 'オーディオ', tab_audio_desc: '音量と操作音。', tab_games: 'ゲーム', tab_games_desc: '各モジュールのカタログとショートカット。', tab_language: '言語', tab_language_desc: 'ブラウザ検出と表示言語。', tab_credits: 'クレジット', tab_credits_desc: 'OverRoll の始まり、コミュニティ、精神。', active_section: '現在の項目', language_eyebrow: '言語と地域', language_title: 'OverRoll の表示言語', language_intro: '自動ではブラウザの優先言語を使用します。手動設定はこの端末だけに保存されます。', language_auto_title: 'ブラウザの言語に従う', language_auto_body: 'navigator.languages を確認し、対応する最も近い言語を選びます。', language_detected: '検出', language_manual_title: '手動で選ぶ', language_manual_body: '自動に戻すまで、ブラウザよりこの設定が優先されます。', language_active: '現在の言語', language_saved: '設定はこのブラウザに保存されます。', credits_kicker: 'OVERROLL · ファンプロジェクト', credits_title: '出たものを使って遊ぼう。', credits_intro: 'OverRoll は選択を運に任せます。チームを作り、ルーレットを回し、出た結果で試合へ。', credits_play: 'ゲームへ戻る', credits_project: 'プロジェクトを見る', credits_hammond_alt: '踊るハモンド', credits_hammond_hint: 'ハモンドのダンス曲を開く', credits_author_label: '制作・ディレクション', credits_author_body: '原案、ビジュアル、機能設計、プロダクト判断、OverRoll の進化。', credits_community_label: '協力', credits_community_title: 'OVERROLL コミュニティ', credits_community_body: '各バージョンを試し、バグを報告し、友人同士のアイデアをみんなのツールへ育てた人たち。', credits_idea: '私たちの考え', credits_manifest: '回す。結果を受け入れる。遊ぶ。', credits_legal_title: 'OverRoll は無料・非公式のファン作品です。', credits_legal_body: '商標、キャラクター、画像、名称の権利は各所有者に帰属します。OverRoll は各社との提携・承認関係にありません。', credits_thanks: '遊んでくれてありがとう',
  },
  'ko-kr': {
    random_picker: '무작위 영웅 선택기', nav_home: '메인', nav_roulette: '룰렛', nav_profiles: '프로필', nav_more: '더보기', settings_kicker: 'OverRoll 환경설정', settings_title: '설정', settings_intro: '범주를 열어 해당 항목만 변경하세요. 전체 페이지를 훑을 필요가 없습니다.', catalog_active: '활성 카탈로그', profiles: '프로필', stored: '저장됨', tab_general: '일반', tab_general_desc: '인터페이스, 성능 및 사용 경험.', tab_audio: '오디오', tab_audio_desc: '볼륨과 상호작용 소리.', tab_games: '게임', tab_games_desc: '각 모듈의 카탈로그와 바로가기.', tab_language: '언어', tab_language_desc: '브라우저 감지 및 인터페이스 언어.', tab_credits: '크레딧', tab_credits_desc: 'OverRoll의 시작, 커뮤니티와 정신.', active_section: '활성 항목', language_eyebrow: '언어 및 지역', language_title: 'OverRoll 표시 언어 선택', language_intro: '자동 모드는 브라우저의 선호 언어를 따릅니다. 수동 선택은 이 기기에만 저장됩니다.', language_auto_title: '브라우저 언어 따르기', language_auto_body: 'navigator.languages를 확인하여 가장 가까운 지원 언어를 선택합니다.', language_detected: '감지됨', language_manual_title: '직접 선택', language_manual_body: '자동으로 돌아갈 때까지 브라우저 설정보다 우선합니다.', language_active: '현재 언어', language_saved: '선택 사항은 이 브라우저에 저장됩니다.', credits_kicker: 'OVERROLL · 팬 프로젝트', credits_title: '나온 대로 플레이.', credits_intro: 'OverRoll은 선택을 운에 맡깁니다. 팀을 만들고 룰렛을 돌린 뒤 나온 결과로 경기에 들어가세요.', credits_play: '게임으로 돌아가기', credits_project: '프로젝트 보기', credits_hammond_alt: '춤추는 해먼드', credits_hammond_hint: '해먼드의 춤 음악 열기', credits_author_label: '제작 및 디렉션', credits_author_body: '원안, 비주얼 정체성, 기능 디자인, 제품 결정과 OverRoll의 발전.', credits_community_label: '도움', credits_community_title: 'OVERROLL 커뮤니티', credits_community_body: '각 버전을 테스트하고 오류를 신고하며 친구들의 아이디어를 모두의 도구로 키운 사람들.', credits_idea: '우리의 생각', credits_manifest: '돌리고. 결과를 받아들이고. 플레이.', credits_legal_title: 'OverRoll은 무료 비공식 팬 프로젝트입니다.', credits_legal_body: '상표, 캐릭터, 이미지 및 이름의 권리는 각 소유자에게 있습니다. OverRoll은 해당 회사와 제휴하거나 승인을 받지 않았습니다.', credits_thanks: '플레이해 주셔서 감사합니다',
  },
}

export function detectBrowserLocale(languages: readonly string[] = typeof navigator === 'undefined' ? ['es-MX'] : navigator.languages): SupportedLocale {
  const values = languages.length ? languages : [typeof navigator === 'undefined' ? 'es-MX' : navigator.language]
  for (const raw of values) {
    const value = raw.toLowerCase()
    if (value.startsWith('es-es')) return 'es-es'
    if (value.startsWith('es')) return 'es-mx'
    if (value.startsWith('pt')) return 'pt-br'
    if (value.startsWith('ja')) return 'ja-jp'
    if (value.startsWith('fr')) return 'fr-fr'
    if (value.startsWith('de')) return 'de-de'
    if (value.startsWith('ko')) return 'ko-kr'
    if (value.startsWith('zh')) return 'zh-cn'
    if (value.startsWith('en')) return 'en-us'
  }
  return 'en-us'
}

export function translate(locale: SupportedLocale, key: CopyKey): string {
  return translations[locale]?.[key] ?? esMx[key]
}

export function localeName(locale: SupportedLocale): string {
  return localeChoices.find((item) => item.id === locale)?.name ?? locale
}

const creditSongs: Record<SupportedLocale, string> = {
  'es-mx': 'https://youtu.be/4Qy0vs80T5M?t=45',
  'en-us': 'https://youtu.be/S9uTScSgzrM?t=95',
  'es-es': 'https://youtu.be/lobBMZr14zw?t=126',
  'de-de': 'https://youtu.be/ANhQ50bMk8I?t=95',
  'fr-fr': 'https://youtu.be/pjJ2w1FX_Wg?t=25',
  'pt-br': 'https://youtu.be/HAiHEQblKeQ?t=25',
  'ko-kr': 'https://youtu.be/hBpV2qzTGFE?t=95',
  'ja-jp': 'https://youtu.be/EjaQdBcF6K4?t=52',
  'zh-cn': 'https://youtu.be/4Qy0vs80T5M?t=45',
}

const creditJokes: Record<SupportedLocale, string> = {
  'es-mx': '¡Se lo llevó el tiburón!',
  'en-us': "I'm already Tracer!",
  'es-es': '¡Hammond se ha marcado un Lúcio!',
  'de-de': 'Ich bin schon Tracer!',
  'fr-fr': 'Et ça fait bim, bam, boum !',
  'pt-br': 'Hammond caiu no samba!',
  'ko-kr': '난 이미 트레이서야!',
  'ja-jp': 'ハモンド、オリオンまで転がった！',
  'zh-cn': 'Hammond 已经滚进战场了！',
}

export function creditsSongUrl(locale: SupportedLocale): string {
  return creditSongs[locale]
}

export function creditsJoke(locale: SupportedLocale): string {
  return creditJokes[locale]
}
