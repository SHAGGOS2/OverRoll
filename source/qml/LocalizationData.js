.pragma library

var localeChoices = [
  {
    "id": "es-mx",
    "name": "Español (Latinoamérica)"
  },
  {
    "id": "es-es",
    "name": "Español (España)"
  },
  {
    "id": "en-us",
    "name": "English (US)"
  },
  {
    "id": "ja-jp",
    "name": "日本語"
  },
  {
    "id": "pt-br",
    "name": "Português (Brasil)"
  },
  {
    "id": "fr-fr",
    "name": "Français"
  },
  {
    "id": "de-de",
    "name": "Deutsch"
  },
  {
    "id": "ko-kr",
    "name": "한국어"
  }
];

var nativeLocales = {
  "es-mx": true,
  "es-es": true,
  "en-us": true
};

var translations = {
  "ja-jp": {
    "app_subtitle": "チームを編成し、ロールをシャッフルして試合へ。",
    "result": "結果",
    "profiles": "プロフィール",
    "settings": "設定",
    "help": "ヘルプ",
    "local_data": "ローカルデータ",
    "prepare": "対戦準備",
    "format": "フォーマット",
    "squad": "チーム",
    "rules": "ルール",
    "quick_hero": "クイックヒーロー",
    "generate": "チームを生成",
    "ready": "ランダム選択の準備完了",
    "ready_body": "チームを設定して「チームを生成」を押してください。",
    "team_122": "1-2-2 チーム",
    "team_222": "2-2-2 チーム",
    "custom_team": "カスタムチーム",
    "custom": "カスタム",
    "custom_teams": "カスタム2チーム",
    "team": "チーム {number}",
    "tank": "タンク",
    "damage": "ダメージ",
    "support": "サポート",
    "any_role": "すべてのロール",
    "players": "人",
    "one_team": "1チーム",
    "two_teams": "2チーム",
    "clear_names": "名前を消去",
    "shuffle": "シャッフル",
    "reset_roles": "ロールをリセット",
    "unique": "ヒーローの重複を避ける",
    "quickplay": "クイック・プレイのみ",
    "role_composition": "ロール構成",
    "random_perks": "パーク／パワーをランダム化",
    "roles_only": "ロールのみ表示",
    "stadium": "スタジアムモード",
    "copy_image": "画像をコピー",
    "random": "ランダム",
    "reroll": "ヒーローを再抽選",
    "filter": "ヒーローを絞り込む",
    "back": "戻る",
    "search": "ヒーローを検索",
    "reset_filters": "フィルターをリセット",
    "all_on": "ロールを有効化",
    "all_off": "ロールを無効化",
    "visible": "表示 {visible} · ブロック {blocked}",
    "profile_mode": "プロフィールモード",
    "profile": "プロフィール",
    "new_profile": "新規プロフィール",
    "delete_profile": "プロフィールを削除",
    "import_profiles": "インポート",
    "export_profiles": "エクスポート",
    "profile_identity": "プロフィール情報",
    "profile_name": "プロフィール名",
    "save_name": "名前を保存",
    "assign_player": "プレイヤーに割り当て",
    "assign": "割り当て",
    "remove": "解除",
    "classify": "ヒーローを分類",
    "classify_help": "各ヒーローの使用頻度を設定します。プロフィールモードが抽選への反映方法を決めます。",
    "main": "メイン",
    "played": "使用済み",
    "practice": "練習中",
    "avoid": "未使用",
    "unmarked": "未設定",
    "all": "すべて",
    "clear_categories": "分類をクリア",
    "sound": "UIサウンド",
    "settings_subtitle": "アプリを再起動せずに体験を調整できます。",
    "help_subtitle": "各機能の使い方をすぐ確認できます。",
    "voices": "再抽選後のボイス",
    "volume": "音量",
    "animations": "カードアニメーション",
    "compact": "コンパクトなパーク表示",
    "language": "言語",
    "update_api": "APIからデータを更新",
    "cancel_api": "更新をキャンセル",
    "api_idle": "更新は実行されていません。",
    "api_data_help": "要求したときだけ新しいスナップショットを取得します。キャンセルしても現在のローカルデータは保持されます。",
    "appearance": "表示とサウンド",
    "data_section": "言語とデータ",
    "credits": "クレジット",
    "credits_body": "デザインディレクション：SHAGGOS\n開発・実装：OpenAI Codex\n更新可能データ：OverFast API\nオーディオ：Overwatch（Blizzard Entertainment）の効果音・音声、Kenney Interface Sounds（CC0）の追加UI音",
    "credits_legal": "無料の非公式ファンプロジェクトで、Blizzard Entertainmentとの提携・承認関係はありません。Overwatchならびに登場人物、名称、商標、画像、音声の権利はBlizzard Entertainment, Inc.に帰属します。",
    "credits_joke": "ハモンド、オリオンまで転がった！",
    "help_start": "はじめに",
    "help_profiles": "プロフィール",
    "help_filters": "フィルター",
    "help_roulette": "ルーレット作成",
    "help_stadium": "スタジアム",
    "help_how_title": "機能",
    "help_steps_title": "手順",
    "help_problem_title": "うまくいかない場合",
    "help_start_steps": "1-2-2、2-2-2、またはカスタムを選びます。|名前を入力し、各プレイヤーが使用できるロールを有効にします。|必要なルールを設定します。|チーム生成を押します。名前の位置は変わりません。",
    "help_profiles_steps": "プロフィールを作成するか保存済みのものを選びます。|ヒーローをメイン、使用、練習、未使用に分類します。|プロフィールモードを選びます。|プレイヤーに割り当てます。",
    "help_filters_steps": "チームを生成し、対象カードのフィルターを開きます。|ヒーローまたはロール全体を無効にします。|フィルターを閉じます。変更はそのカードに保存されます。|再抽選するとロール、プロフィール、ブロックが反映されます。",
    "help_roulette_steps": "フォーマットでルーレット作成を選びます。|参加するロールとヒーローを選びます。|各ヒーローの - と + で枠数を設定します。|ルーレット作成、次に回すを押します。",
    "help_stadium_steps": "ルールでスタジアムモードを有効にします。|チームを生成します。|各カードに通常パークではなく4つのスタジアムパワーが表示されます。|クイック・プレイへ戻るにはオフにします。",
    "help_roulette_body": "ルーレット作成はリストからヒーローを1人選びます。枠数が多いほど当選確率が上がります。",
    "help_roulette_tip": "例：アナ x4、ゲンジ x1 なら全5枠で、確率はアナ80%、ゲンジ20%です。",
    "help_start_body": "1-2-2または2-2-2で固定構成を選べます。カスタムでは1～24人、1チームまたは2チームを設定できます。名前の位置は固定され、各プレイヤーで有効なロールに従ってロールがランダムに割り当てられます。",
    "help_profiles_body": "プロフィールではヒーローをメイン、使用済み、練習中、未使用に分類できます。プレイヤーへ割り当ててモードを選ぶと、分類に応じて抽選確率や候補が変わります。",
    "help_filters_body": "各カードのフィルターボタンは、そのプレイヤーで有効なロールをすべて使用します。ヒーロー単位のブロック、ロール全体の有効化・無効化、結果画面内でのフィルターリセットが可能です。",
    "help_stadium_body": "スタジアム対応ヒーローだけに絞り、4つのスタジアムパワーを表示します。オフにすると通常のクイック・プレイ用パークへ戻ります。\n\n7月16日更新：このモードはもう死んだ XD",
    "help_summary": "要点",
    "help_start_tip": "すぐ始めるには、フォーマットを選び、各プレイヤーが使用できるロールを有効にして「チームを生成」を押します。",
    "help_profiles_tip": "プロフィールは候補ヒーローを調整しますが、カードのロールやヒーローフィルターを無視することはありません。",
    "help_filters_tip": "候補が少ない場合は、まず有効なロールを確認し、次にブロック済みヒーローを確認してください。",
    "help_stadium_tip": "旧スタジアム用の試合だけで使用してください。クイック・プレイではオフ推奨です。",
    "no_profile": "プロフィールなし",
    "snapshot": "ローカルデータ · 更新 {date}",
    "snapshot_unknown": "ローカルデータ · 日付不明",
    "api_running": "ローカルスナップショットを更新中…",
    "api_cancelling": "更新をキャンセル中…",
    "api_cancelled": "更新をキャンセルしました。以前のローカルデータは保持されています。",
    "api_done": "データを更新しました。新しいスナップショットを使用しています。",
    "api_failed": "更新を完了できませんでした。",
    "no_candidates": "現在のロール、プロフィール、フィルターでは有効な組み合わせがありません。",
    "no_alternative": "このカードで選べる別のヒーローがありません。",
    "image_copied": "結果カードをクリップボードにコピーしました。",
    "mode_classic": "クラシック",
    "mode_allprofile": "設定済みすべて",
    "mode_lowprob": "新規開拓",
    "mode_practice": "練習",
    "mode_played": "未使用を除外",
    "mode_prefer": "お気に入り",
    "mode_main": "メインのみ",
    "mode_classic_help": "プロフィールを考慮しません。ロールとフィルターで許可されたヒーローから選びます。",
    "mode_allprofile_help": "メイン、使用済み、練習中、未使用から均等に選びます。設定済み候補がある間、未設定ヒーローは除外されます。",
    "mode_lowprob_help": "変化を増やすモードです。未使用8、練習中5、使用済み3、メイン1の重みで、慣れていないヒーローほど出やすくなります。",
    "mode_practice_help": "練習中または未使用に設定されたヒーローだけを探します。ヒーロープールを広げる練習向けです。",
    "mode_played_help": "メイン、使用済み、練習中から選び、未使用に設定されたヒーローを避けます。",
    "mode_prefer_help": "メインと使用済みだけを探します。得意または普段使うヒーロー向けです。",
    "mode_main_help": "メインだけを探します。指定ロールに候補がない場合は、チーム生成を止めないよう許可プールへフォールバックします。",
    "profile_locked": "プロフィール",
    "on": "オン",
    "off": "オフ",
    "quickplay_label": "クイック・プレイ",
    "stadium_label": "スタジアム",
    "app_title": "ランダムヒーローピッカー",
    "header_subtitle": "ランダムヒーローピッカー"
  },
  "pt-br": {
    "app_subtitle": "Monte a equipe, embaralhe as funções e parta para a partida.",
    "result": "Resultado",
    "profiles": "Perfis",
    "settings": "Configurações",
    "help": "Ajuda",
    "local_data": "Dados locais",
    "prepare": "Preparação da partida",
    "format": "Formato",
    "squad": "Equipe",
    "rules": "Regras",
    "quick_hero": "Herói rápido",
    "generate": "Gerar equipe",
    "ready": "Pronto para sortear",
    "ready_body": "Configure a equipe e pressione “Gerar equipe”.",
    "team_122": "Equipe 1-2-2",
    "team_222": "Equipe 2-2-2",
    "custom_team": "Equipe personalizada",
    "custom": "PERSONALIZADO",
    "custom_teams": "2 equipes personalizadas",
    "team": "Equipe {number}",
    "tank": "Tanque",
    "damage": "Dano",
    "support": "Suporte",
    "any_role": "Qualquer função",
    "players": "jogadores",
    "one_team": "1 equipe",
    "two_teams": "2 equipes",
    "clear_names": "Limpar nomes",
    "shuffle": "Embaralhar",
    "reset_roles": "Redefinir funções",
    "unique": "Evitar heróis repetidos",
    "quickplay": "Somente Jogo Rápido",
    "role_composition": "Composição de funções",
    "random_perks": "Sortear vantagens/poderes",
    "roles_only": "Mostrar apenas funções",
    "stadium": "Modo Estádio",
    "copy_image": "Copiar imagem",
    "random": "Aleatório",
    "reroll": "Sortear outro herói",
    "filter": "Filtrar heróis",
    "back": "Voltar",
    "search": "Buscar herói",
    "reset_filters": "Redefinir filtros",
    "all_on": "Ativar todas as funções",
    "all_off": "Desativar todas as funções",
    "visible": "Visíveis {visible} · Bloqueados {blocked}",
    "profile_mode": "Modo de perfil",
    "profile": "Perfil",
    "new_profile": "Novo perfil",
    "delete_profile": "Excluir perfil",
    "import_profiles": "Importar",
    "export_profiles": "Exportar",
    "profile_identity": "Informações do perfil",
    "profile_name": "Nome do perfil",
    "save_name": "Salvar nome",
    "assign_player": "Atribuir ao jogador",
    "assign": "Atribuir",
    "remove": "Remover",
    "classify": "Classificar heróis",
    "classify_help": "Defina a frequência de uso de cada herói. O modo de perfil determina como isso afeta o sorteio.",
    "main": "Principal",
    "played": "Usado",
    "practice": "Treinando",
    "avoid": "Evitar",
    "unmarked": "Sem marcação",
    "all": "Todos",
    "clear_categories": "Limpar classificações",
    "sound": "Sons da interface",
    "settings_subtitle": "Ajuste a experiência sem reiniciar o aplicativo.",
    "help_subtitle": "Consulte rapidamente como cada recurso funciona.",
    "voices": "Vozes após novo sorteio",
    "volume": "Volume",
    "animations": "Animações dos cartões",
    "compact": "Vantagens compactas",
    "language": "Idioma",
    "update_api": "Atualizar dados pela API",
    "cancel_api": "Cancelar atualização",
    "api_idle": "Nenhuma atualização em andamento.",
    "api_data_help": "Baixa um novo snapshot somente quando solicitado. Cancelar mantém os dados locais atuais.",
    "appearance": "Aparência e som",
    "data_section": "Idioma e dados",
    "credits": "Créditos",
    "credits_body": "Direção de design: SHAGGOS\nDesenvolvimento e implementação: OpenAI Codex\nDados atualizáveis: OverFast API\nÁudio: efeitos e vozes de Overwatch (Blizzard Entertainment); sons adicionais de interface de Kenney, Interface Sounds (CC0)",
    "credits_legal": "Projeto gratuito e não oficial, sem vínculo ou aprovação da Blizzard Entertainment. Overwatch e seus personagens, nomes, marcas, imagens e áudios pertencem à Blizzard Entertainment, Inc.",
    "credits_joke": "Hammond caiu no samba!",
    "help_start": "Primeiros passos",
    "help_profiles": "Perfis",
    "help_filters": "Filtros",
    "help_roulette": "Criador de roleta",
    "help_stadium": "Estádio",
    "help_how_title": "O que faz",
    "help_steps_title": "Passo a passo",
    "help_problem_title": "Se algo der errado",
    "help_start_steps": "Escolha 1-2-2, 2-2-2 ou Personalizado.|Digite os nomes e deixe ativas as funções aceitas por cada pessoa.|Ajuste as regras desejadas.|Pressione Gerar equipe. Os nomes não mudam de lugar.",
    "help_profiles_steps": "Crie um perfil ou escolha um salvo.|Classifique os heróis como Main, Usado, Jogado ou Não usado.|Escolha o modo de perfil.|Vincule o perfil a um jogador.",
    "help_filters_steps": "Gere uma equipe e abra o filtro do cartão desejado.|Desative um herói ou uma função inteira.|Feche o filtro; a alteração fica nesse cartão.|Use o reroll; funções, perfil e bloqueios serão respeitados.",
    "help_roulette_steps": "Escolha Criador de roleta em Formato.|Selecione funções e heróis participantes.|Use - e + para definir as casas de cada herói.|Pressione Criar roleta e depois Girar roleta.",
    "help_stadium_steps": "Ative o modo Estádio em Regras.|Gere a equipe.|Cada cartão exibirá quatro poderes de Estádio no lugar das perks normais.|Desative para voltar ao Jogo Rápido.",
    "help_roulette_body": "O Criador de roleta escolhe um herói da sua lista. Mais casas significam maior chance de vencer.",
    "help_roulette_tip": "Exemplo: Ana x4 e Genji x1 formam cinco casas; Ana tem 80% e Genji 20%.",
    "help_summary": "Resumo",
    "no_profile": "Sem perfil",
    "snapshot": "Dados locais · Atualizado em {date}",
    "snapshot_unknown": "Dados locais · Sem data",
    "api_running": "Atualizando snapshot local…",
    "api_cancelling": "Cancelando atualização…",
    "api_cancelled": "Atualização cancelada. Os dados locais anteriores foram mantidos.",
    "api_done": "Dados atualizados. O novo snapshot está em uso.",
    "api_failed": "Não foi possível concluir a atualização.",
    "no_candidates": "Nenhuma combinação válida corresponde às funções, perfis e filtros atuais.",
    "no_alternative": "Não há outro herói disponível para este cartão.",
    "image_copied": "Cartões de resultado copiados para a área de transferência.",
    "mode_classic": "Clássico",
    "mode_allprofile": "Todos classificados",
    "mode_lowprob": "Explorar",
    "mode_practice": "Treino",
    "mode_played": "Excluir evitados",
    "mode_prefer": "Preferidos",
    "mode_main": "Somente principais",
    "profile_locked": "PERFIL",
    "on": "LIG.",
    "off": "DESL.",
    "quickplay_label": "JOGO RÁPIDO",
    "stadium_label": "ESTÁDIO",
    "app_title": "Seletor aleatório de heróis",
    "header_subtitle": "SELETOR ALEATÓRIO DE HERÓIS",
    "help_start_body": "Escolha 1-2-2 ou 2-2-2 para uma composição fixa. No modo personalizado, configure de 1 a 24 jogadores e uma ou duas equipes. Os nomes permanecem em suas posições e as funções são sorteadas entre as habilitadas para cada jogador.",
    "help_profiles_body": "Nos perfis, classifique heróis como Principal, Usado, Treinando ou Evitar. Ao atribuir um perfil a um jogador, o modo escolhido altera as probabilidades e os candidatos.",
    "help_filters_body": "O botão de filtro de cada cartão usa todas as funções habilitadas para aquele jogador. Você pode bloquear heróis, ativar ou desativar funções inteiras e redefinir os filtros na tela de resultado.",
    "help_stadium_body": "Limita o sorteio a heróis compatíveis com Estádio e mostra quatro poderes. Desative para voltar às vantagens normais do Jogo Rápido.\n\nAtualização de 16 de julho: este modo já morreu XD",
    "help_start_tip": "Para começar rápido, escolha o formato, ative as funções disponíveis para cada jogador e pressione “Gerar equipe”.",
    "help_profiles_tip": "O perfil ajusta os candidatos, mas nunca ignora a função ou os filtros do cartão.",
    "help_filters_tip": "Se houver poucos candidatos, confira primeiro as funções habilitadas e depois os heróis bloqueados.",
    "help_stadium_tip": "Use apenas em partidas do antigo Estádio. Para Jogo Rápido, recomenda-se desativar.",
    "mode_classic_help": "Ignora o perfil e escolhe entre os heróis permitidos pelas funções e filtros.",
    "mode_allprofile_help": "Escolhe igualmente entre Principal, Usado, Treinando e Evitar. Enquanto houver classificados, os não marcados ficam fora.",
    "mode_lowprob_help": "Favorece heróis menos familiares: Evitar 8, Treinando 5, Usado 3 e Principal 1.",
    "mode_practice_help": "Escolhe apenas heróis marcados como Treinando ou Evitar para ampliar seu repertório.",
    "mode_played_help": "Escolhe entre Principal, Usado e Treinando, evitando os marcados como Evitar.",
    "mode_prefer_help": "Escolhe apenas Principal e Usado.",
    "mode_main_help": "Escolhe apenas Principais; se não houver candidato para a função, usa o conjunto permitido para não interromper a geração."
  },
  "fr-fr": {
    "app_subtitle": "Composez l’équipe, mélangez les rôles et lancez la partie.",
    "result": "Résultat",
    "profiles": "Profils",
    "settings": "Paramètres",
    "help": "Aide",
    "local_data": "Données locales",
    "prepare": "Préparation du match",
    "format": "Format",
    "squad": "Équipe",
    "rules": "Règles",
    "quick_hero": "Héros rapide",
    "generate": "Générer l’équipe",
    "ready": "Prêt pour le tirage",
    "ready_body": "Configurez l’équipe puis appuyez sur « Générer l’équipe ».",
    "team_122": "Équipe 1-2-2",
    "team_222": "Équipe 2-2-2",
    "custom_team": "Équipe personnalisée",
    "custom": "PERSONNALISÉ",
    "custom_teams": "2 équipes personnalisées",
    "team": "Équipe {number}",
    "tank": "Tank",
    "damage": "Dégâts",
    "support": "Soutien",
    "any_role": "Tous les rôles",
    "players": "joueurs",
    "one_team": "1 équipe",
    "two_teams": "2 équipes",
    "clear_names": "Effacer les noms",
    "shuffle": "Mélanger",
    "reset_roles": "Réinitialiser les rôles",
    "unique": "Éviter les héros en double",
    "quickplay": "Partie rapide uniquement",
    "role_composition": "Composition des rôles",
    "random_perks": "Choisir aléatoirement les avantages/pouvoirs",
    "roles_only": "Afficher uniquement les rôles",
    "stadium": "Mode Stadium",
    "copy_image": "Copier l’image",
    "random": "Aléatoire",
    "reroll": "Relancer le héros",
    "filter": "Filtrer les héros",
    "back": "Retour",
    "search": "Rechercher un héros",
    "reset_filters": "Réinitialiser les filtres",
    "all_on": "Activer tous les rôles",
    "all_off": "Désactiver tous les rôles",
    "visible": "Visibles {visible} · Bloqués {blocked}",
    "profile_mode": "Mode de profil",
    "profile": "Profil",
    "new_profile": "Nouveau profil",
    "delete_profile": "Supprimer le profil",
    "import_profiles": "Importer",
    "export_profiles": "Exporter",
    "profile_identity": "Informations du profil",
    "profile_name": "Nom du profil",
    "save_name": "Enregistrer",
    "assign_player": "Attribuer au joueur",
    "assign": "Attribuer",
    "remove": "Retirer",
    "classify": "Classer les héros",
    "classify_help": "Définissez la fréquence d’utilisation de chaque héros. Le mode de profil détermine son influence sur le tirage.",
    "main": "Principal",
    "played": "Joué",
    "practice": "Entraînement",
    "avoid": "À éviter",
    "unmarked": "Non classé",
    "all": "Tous",
    "clear_categories": "Effacer les catégories",
    "sound": "Sons de l’interface",
    "settings_subtitle": "Ajustez l’expérience sans redémarrer l’application.",
    "help_subtitle": "Consultez rapidement le fonctionnement de chaque option.",
    "voices": "Voix après relance",
    "volume": "Volume",
    "animations": "Animations des cartes",
    "compact": "Affichage compact des avantages",
    "language": "Langue",
    "update_api": "Mettre à jour depuis l’API",
    "cancel_api": "Annuler la mise à jour",
    "api_idle": "Aucune mise à jour en cours.",
    "api_data_help": "Télécharge un nouvel instantané uniquement sur demande. L’annulation conserve les données locales actuelles.",
    "appearance": "Affichage et son",
    "data_section": "Langue et données",
    "credits": "Crédits",
    "credits_body": "Direction artistique : SHAGGOS\nDéveloppement et mise en œuvre : OpenAI Codex\nDonnées actualisables : OverFast API\nAudio : effets et voix d’Overwatch (Blizzard Entertainment) ; sons d’interface supplémentaires de Kenney, Interface Sounds (CC0)",
    "credits_legal": "Projet de fans gratuit et non officiel, sans affiliation ni approbation de Blizzard Entertainment. Overwatch, ses personnages, noms, marques, images et sons appartiennent à Blizzard Entertainment, Inc.",
    "credits_joke": "Et ça fait bim, bam, boum !",
    "help_start": "Bien démarrer",
    "help_profiles": "Profils",
    "help_filters": "Filtres",
    "help_roulette": "Créateur de roulette",
    "help_stadium": "Stadium",
    "help_how_title": "Fonction",
    "help_steps_title": "Étape par étape",
    "help_problem_title": "En cas de problème",
    "help_start_steps": "Choisissez 1-2-2, 2-2-2 ou Personnalisé.|Saisissez les noms et gardez les rôles acceptés actifs.|Réglez les règles souhaitées.|Appuyez sur Générer l'équipe. Les noms restent en place.",
    "help_profiles_steps": "Créez un profil ou choisissez-en un.|Classez les héros en Main, Utilisé, Joué ou Non utilisé.|Choisissez le mode de profil.|Associez le profil à un joueur.",
    "help_filters_steps": "Générez une équipe et ouvrez le filtre de la carte voulue.|Désactivez un héros ou un rôle entier.|Fermez le filtre ; le changement reste sur cette carte.|Relancez ; rôles, profil et blocages seront respectés.",
    "help_roulette_steps": "Choisissez Créateur de roulette dans Format.|Sélectionnez les rôles et héros participants.|Utilisez - et + pour définir les cases de chaque héros.|Appuyez sur Créer la roulette puis Tourner.",
    "help_stadium_steps": "Activez le mode Stadium dans Règles.|Générez l'équipe.|Chaque carte affiche quatre pouvoirs Stadium à la place des perks normales.|Désactivez-le pour revenir au Jeu rapide.",
    "help_roulette_body": "Le créateur choisit un héros dans votre liste. Plus un héros a de cases, plus il a de chances de gagner.",
    "help_roulette_tip": "Exemple : Ana x4 et Genji x1 donnent cinq cases ; Ana a 80 % et Genji 20 %.",
    "help_summary": "En bref",
    "no_profile": "Aucun profil",
    "snapshot": "Données locales · Mise à jour {date}",
    "snapshot_unknown": "Données locales · Date inconnue",
    "api_running": "Mise à jour de l’instantané local…",
    "api_cancelling": "Annulation de la mise à jour…",
    "api_cancelled": "Mise à jour annulée. Les anciennes données locales ont été conservées.",
    "api_done": "Données mises à jour. Le nouvel instantané est utilisé.",
    "api_failed": "La mise à jour n’a pas pu être terminée.",
    "no_candidates": "Aucune combinaison valide ne correspond aux rôles, profils et filtres actuels.",
    "no_alternative": "Aucun autre héros n’est disponible pour cette carte.",
    "image_copied": "Cartes de résultat copiées dans le presse-papiers.",
    "mode_classic": "Classique",
    "mode_allprofile": "Tous les héros classés",
    "mode_lowprob": "Découverte",
    "mode_practice": "Entraînement",
    "mode_played": "Exclure à éviter",
    "mode_prefer": "Favoris",
    "mode_main": "Principaux uniquement",
    "profile_locked": "PROFIL",
    "on": "OUI",
    "off": "NON",
    "quickplay_label": "PARTIE RAPIDE",
    "stadium_label": "STADIUM",
    "app_title": "Sélecteur aléatoire de héros",
    "header_subtitle": "SÉLECTEUR ALÉATOIRE DE HÉROS",
    "help_start_body": "Choisissez 1-2-2 ou 2-2-2 pour une composition fixe. En mode personnalisé, configurez de 1 à 24 joueurs et une ou deux équipes. Les noms restent à leur position et les rôles sont tirés parmi ceux autorisés pour chaque joueur.",
    "help_profiles_body": "Les profils classent les héros comme Principal, Joué, Entraînement ou À éviter. Une fois attribué à un joueur, le mode choisi modifie les probabilités et les candidats.",
    "help_filters_body": "Le bouton de filtre de chaque carte utilise tous les rôles autorisés pour ce joueur. Vous pouvez bloquer des héros, activer ou désactiver des rôles entiers et réinitialiser les filtres depuis les résultats.",
    "help_stadium_body": "Limite le tirage aux héros compatibles avec Stadium et affiche quatre pouvoirs. Désactivez cette option pour revenir aux avantages de Partie rapide.\n\nMise à jour du 16 juillet : ce mode est déjà mort XD",
    "help_start_tip": "Pour commencer vite, choisissez le format, activez les rôles de chaque joueur puis appuyez sur « Générer l’équipe ».",
    "help_profiles_tip": "Le profil ajuste les candidats sans contourner les rôles ni les filtres de la carte.",
    "help_filters_tip": "S’il reste peu de candidats, vérifiez d’abord les rôles actifs puis les héros bloqués.",
    "help_stadium_tip": "À utiliser uniquement pour les anciennes parties Stadium. Désactivation conseillée en Partie rapide.",
    "mode_classic_help": "Ignore les profils et choisit parmi les héros autorisés par les rôles et filtres.",
    "mode_allprofile_help": "Choisit équitablement parmi Principal, Joué, Entraînement et À éviter. Les héros non classés sont exclus tant qu’il existe des candidats classés.",
    "mode_lowprob_help": "Favorise les héros moins familiers : À éviter 8, Entraînement 5, Joué 3 et Principal 1.",
    "mode_practice_help": "Choisit seulement les héros en Entraînement ou À éviter pour élargir votre sélection.",
    "mode_played_help": "Choisit parmi Principal, Joué et Entraînement, sans ceux marqués À éviter.",
    "mode_prefer_help": "Choisit uniquement Principal et Joué.",
    "mode_main_help": "Choisit uniquement les héros Principaux ; s’il n’y en a aucun pour le rôle, utilise la sélection autorisée."
  },
  "de-de": {
    "app_subtitle": "Stellt das Team zusammen, mischt die Rollen und startet ins Match.",
    "result": "Ergebnis",
    "profiles": "Profile",
    "settings": "Einstellungen",
    "help": "Hilfe",
    "local_data": "Lokale Daten",
    "prepare": "Matchvorbereitung",
    "format": "Format",
    "squad": "Team",
    "rules": "Regeln",
    "quick_hero": "Schnellheld",
    "generate": "Team erstellen",
    "ready": "Bereit zum Auslosen",
    "ready_body": "Richtet das Team ein und klickt auf „Team erstellen“.",
    "team_122": "1-2-2-Team",
    "team_222": "2-2-2-Team",
    "custom_team": "Benutzerdefiniertes Team",
    "custom": "BENUTZERDEFINIERT",
    "custom_teams": "2 benutzerdefinierte Teams",
    "team": "Team {number}",
    "tank": "Tank",
    "damage": "Schaden",
    "support": "Unterstützung",
    "any_role": "Alle Rollen",
    "players": "Spieler",
    "one_team": "1 Team",
    "two_teams": "2 Teams",
    "clear_names": "Namen löschen",
    "shuffle": "Mischen",
    "reset_roles": "Rollen zurücksetzen",
    "unique": "Doppelte Helden vermeiden",
    "quickplay": "Nur Schnellsuche",
    "role_composition": "Rollenzusammenstellung",
    "random_perks": "Perks/Kräfte zufällig wählen",
    "roles_only": "Nur Rollen anzeigen",
    "stadium": "Stadionmodus",
    "copy_image": "Bild kopieren",
    "random": "Zufällig",
    "reroll": "Held neu auslosen",
    "filter": "Helden filtern",
    "back": "Zurück",
    "search": "Helden suchen",
    "reset_filters": "Filter zurücksetzen",
    "all_on": "Alle Rollen aktivieren",
    "all_off": "Alle Rollen deaktivieren",
    "visible": "Sichtbar {visible} · Blockiert {blocked}",
    "profile_mode": "Profilmodus",
    "profile": "Profil",
    "new_profile": "Neues Profil",
    "delete_profile": "Profil löschen",
    "import_profiles": "Importieren",
    "export_profiles": "Exportieren",
    "profile_identity": "Profilinformationen",
    "profile_name": "Profilname",
    "save_name": "Name speichern",
    "assign_player": "Spieler zuweisen",
    "assign": "Zuweisen",
    "remove": "Entfernen",
    "classify": "Helden einordnen",
    "classify_help": "Legt fest, wie häufig ihr jeden Helden nutzt. Der Profilmodus bestimmt den Einfluss auf die Auslosung.",
    "main": "Main",
    "played": "Gespielt",
    "practice": "Training",
    "avoid": "Meiden",
    "unmarked": "Nicht markiert",
    "all": "Alle",
    "clear_categories": "Kategorien löschen",
    "sound": "UI-Sounds",
    "settings_subtitle": "Passt die App ohne Neustart an.",
    "help_subtitle": "Seht schnell nach, wie die einzelnen Funktionen arbeiten.",
    "voices": "Stimmen nach Neuauslosung",
    "volume": "Lautstärke",
    "animations": "Kartenanimationen",
    "compact": "Kompakte Perk-Anzeige",
    "language": "Sprache",
    "update_api": "Daten über API aktualisieren",
    "cancel_api": "Aktualisierung abbrechen",
    "api_idle": "Keine Aktualisierung aktiv.",
    "api_data_help": "Lädt nur auf Wunsch einen neuen Snapshot. Beim Abbrechen bleiben die aktuellen lokalen Daten erhalten.",
    "appearance": "Darstellung und Ton",
    "data_section": "Sprache und Daten",
    "credits": "Mitwirkende",
    "credits_body": "Designleitung: SHAGGOS\nEntwicklung und Umsetzung: OpenAI Codex\nAktualisierbare Daten: OverFast API\nAudio: Effekte und Stimmen aus Overwatch (Blizzard Entertainment); zusätzliche Interface-Sounds von Kenney, Interface Sounds (CC0)",
    "credits_legal": "Kostenloses, inoffizielles Fanprojekt ohne Verbindung oder Zustimmung von Blizzard Entertainment. Overwatch sowie Figuren, Namen, Marken, Bilder und Audios gehören Blizzard Entertainment, Inc.",
    "credits_joke": "Ich bin schon Tracer!",
    "help_start": "Erste Schritte",
    "help_profiles": "Profile",
    "help_filters": "Filter",
    "help_roulette": "Roulette-Editor",
    "help_stadium": "Stadion",
    "help_how_title": "Funktion",
    "help_steps_title": "Schritt für Schritt",
    "help_problem_title": "Falls etwas nicht klappt",
    "help_start_steps": "Wähle 1-2-2, 2-2-2 oder Benutzerdefiniert.|Trage Namen ein und aktiviere die erlaubten Rollen.|Stelle die gewünschten Regeln ein.|Klicke Team erstellen. Die Namen bleiben an ihrem Platz.",
    "help_profiles_steps": "Erstelle ein Profil oder wähle ein gespeichertes.|Ordne Helden als Main, Verwendet, Gespielt oder Nicht verwendet ein.|Wähle den Profilmodus.|Verknüpfe das Profil mit einem Spieler.",
    "help_filters_steps": "Erstelle ein Team und öffne den Filter der gewünschten Karte.|Deaktiviere einen Helden oder eine ganze Rolle.|Schließe den Filter; die Änderung bleibt auf dieser Karte.|Beim Neuwürfeln gelten Rollen, Profil und Sperren.",
    "help_roulette_steps": "Wähle Roulette-Editor unter Format.|Wähle Rollen und Helden aus.|Lege mit - und + die Felder pro Held fest.|Klicke Roulette erstellen und danach Drehen.",
    "help_stadium_steps": "Aktiviere den Stadionmodus unter Regeln.|Erstelle das Team.|Jede Karte zeigt vier Stadion-Powers statt normaler Perks.|Zum Schnellspiel wieder ausschalten.",
    "help_roulette_body": "Der Roulette-Editor wählt einen Helden aus deiner Liste. Mehr Felder bedeuten eine höhere Gewinnchance.",
    "help_roulette_tip": "Beispiel: Ana x4 und Genji x1 ergeben fünf Felder; Ana hat 80 %, Genji 20 %.",
    "help_summary": "Kurz erklärt",
    "no_profile": "Kein Profil",
    "snapshot": "Lokale Daten · Aktualisiert {date}",
    "snapshot_unknown": "Lokale Daten · Kein Datum",
    "api_running": "Lokaler Snapshot wird aktualisiert…",
    "api_cancelling": "Aktualisierung wird abgebrochen…",
    "api_cancelled": "Aktualisierung abgebrochen. Die vorherigen lokalen Daten wurden beibehalten.",
    "api_done": "Daten aktualisiert. Der neue Snapshot wird verwendet.",
    "api_failed": "Die Aktualisierung konnte nicht abgeschlossen werden.",
    "no_candidates": "Keine gültige Kombination passt zu den aktuellen Rollen, Profilen und Filtern.",
    "no_alternative": "Für diese Karte ist kein anderer Held verfügbar.",
    "image_copied": "Ergebniskarten wurden in die Zwischenablage kopiert.",
    "mode_classic": "Klassisch",
    "mode_allprofile": "Alle kategorisierten",
    "mode_lowprob": "Entdecken",
    "mode_practice": "Training",
    "mode_played": "Gemiedene ausschließen",
    "mode_prefer": "Bevorzugt",
    "mode_main": "Nur Mains",
    "profile_locked": "PROFIL",
    "on": "AN",
    "off": "AUS",
    "quickplay_label": "SCHNELLSUCHE",
    "stadium_label": "STADION",
    "app_title": "Zufällige Heldenauswahl",
    "header_subtitle": "ZUFÄLLIGE HELDENAUSWAHL",
    "help_start_body": "Wählt 1-2-2 oder 2-2-2 für eine feste Aufstellung. Benutzerdefiniert sind 1–24 Spieler und ein oder zwei Teams möglich. Namen bleiben an ihrer Position; Rollen werden aus den pro Spieler aktivierten Rollen ausgelost.",
    "help_profiles_body": "Profile ordnen Helden als Main, Gespielt, Training oder Meiden ein. Nach der Zuweisung verändert der gewählte Modus Wahrscheinlichkeiten und Kandidaten.",
    "help_filters_body": "Der Filter jeder Karte nutzt alle für diesen Spieler aktivierten Rollen. Ihr könnt einzelne Helden blockieren, ganze Rollen ein- oder ausschalten und die Filter im Ergebnis zurücksetzen.",
    "help_stadium_body": "Beschränkt die Auswahl auf Stadion-Helden und zeigt vier Kräfte. Deaktiviert die Option für normale Schnellsuche-Perks.\n\nUpdate vom 16. Juli: Dieser Modus ist schon tot XD",
    "help_start_tip": "Wählt Format und Rollen und klickt anschließend auf „Team erstellen“.",
    "help_profiles_tip": "Profile beeinflussen Kandidaten, umgehen aber keine Rollen- oder Heldenfilter.",
    "help_filters_tip": "Bei wenigen Kandidaten zuerst die aktiven Rollen und danach blockierte Helden prüfen.",
    "help_stadium_tip": "Nur für alte Stadion-Matches verwenden; für Schnellsuche besser deaktivieren.",
    "mode_classic_help": "Ignoriert Profile und wählt aus den durch Rollen und Filter erlaubten Helden.",
    "mode_allprofile_help": "Wählt gleichmäßig aus Main, Gespielt, Training und Meiden. Nicht markierte Helden bleiben außen vor, solange markierte Kandidaten vorhanden sind.",
    "mode_lowprob_help": "Bevorzugt ungewohnte Helden: Meiden 8, Training 5, Gespielt 3, Main 1.",
    "mode_practice_help": "Wählt nur Helden aus Training oder Meiden, um den Heldenpool zu erweitern.",
    "mode_played_help": "Wählt Main, Gespielt und Training und vermeidet als Meiden markierte Helden.",
    "mode_prefer_help": "Wählt nur Main und Gespielt.",
    "mode_main_help": "Wählt nur Mains; fehlt ein Kandidat für die Rolle, wird auf den erlaubten Pool zurückgegriffen."
  },
  "ko-kr": {
    "app_subtitle": "팀을 구성하고 역할을 섞어 경기를 시작하세요.",
    "result": "결과",
    "profiles": "프로필",
    "settings": "설정",
    "help": "도움말",
    "local_data": "로컬 데이터",
    "prepare": "경기 준비",
    "format": "형식",
    "squad": "팀",
    "rules": "규칙",
    "quick_hero": "빠른 영웅",
    "generate": "팀 생성",
    "ready": "무작위 선택 준비 완료",
    "ready_body": "팀을 설정한 뒤 “팀 생성”을 누르세요.",
    "team_122": "1-2-2 팀",
    "team_222": "2-2-2 팀",
    "custom_team": "사용자 지정 팀",
    "custom": "사용자 지정",
    "custom_teams": "사용자 지정 2팀",
    "team": "팀 {number}",
    "tank": "돌격",
    "damage": "공격",
    "support": "지원",
    "any_role": "모든 역할",
    "players": "명",
    "one_team": "1팀",
    "two_teams": "2팀",
    "clear_names": "이름 지우기",
    "shuffle": "섞기",
    "reset_roles": "역할 초기화",
    "unique": "중복 영웅 방지",
    "quickplay": "빠른 대전만",
    "role_composition": "역할 구성",
    "random_perks": "특전/파워 무작위 선택",
    "roles_only": "역할만 표시",
    "stadium": "스타디움 모드",
    "copy_image": "이미지 복사",
    "random": "무작위",
    "reroll": "영웅 다시 뽑기",
    "filter": "영웅 필터",
    "back": "뒤로",
    "search": "영웅 검색",
    "reset_filters": "필터 초기화",
    "all_on": "모든 역할 켜기",
    "all_off": "모든 역할 끄기",
    "visible": "표시 {visible} · 차단 {blocked}",
    "profile_mode": "프로필 모드",
    "profile": "프로필",
    "new_profile": "새 프로필",
    "delete_profile": "프로필 삭제",
    "import_profiles": "가져오기",
    "export_profiles": "내보내기",
    "profile_identity": "프로필 정보",
    "profile_name": "프로필 이름",
    "save_name": "이름 저장",
    "assign_player": "플레이어에게 지정",
    "assign": "지정",
    "remove": "해제",
    "classify": "영웅 분류",
    "classify_help": "각 영웅의 사용 빈도를 설정합니다. 프로필 모드에 따라 추첨 반영 방식이 달라집니다.",
    "main": "주 영웅",
    "played": "사용함",
    "practice": "연습 중",
    "avoid": "피하기",
    "unmarked": "미지정",
    "all": "모두",
    "clear_categories": "분류 초기화",
    "sound": "UI 소리",
    "settings_subtitle": "앱을 다시 시작하지 않고 환경을 조정할 수 있습니다.",
    "help_subtitle": "각 기능의 사용법을 빠르게 확인하세요.",
    "voices": "재추첨 후 음성",
    "volume": "음량",
    "animations": "카드 애니메이션",
    "compact": "간단한 특전 표시",
    "language": "언어",
    "update_api": "API에서 데이터 업데이트",
    "cancel_api": "업데이트 취소",
    "api_idle": "진행 중인 업데이트가 없습니다.",
    "api_data_help": "요청할 때만 새 스냅샷을 가져옵니다. 취소해도 현재 로컬 데이터는 유지됩니다.",
    "appearance": "화면 및 소리",
    "data_section": "언어 및 데이터",
    "credits": "크레딧",
    "credits_body": "디자인 디렉션: SHAGGOS\n개발 및 구현: OpenAI Codex\n업데이트 가능한 데이터: OverFast API\n오디오: Overwatch(Blizzard Entertainment) 효과음과 음성, Kenney Interface Sounds(CC0)의 추가 UI 사운드",
    "credits_legal": "Blizzard Entertainment와 제휴하거나 승인을 받지 않은 무료 비공식 팬 프로젝트입니다. Overwatch 및 캐릭터, 명칭, 상표, 이미지와 음성의 권리는 Blizzard Entertainment, Inc.에 있습니다.",
    "credits_joke": "난 이미 트레이서야!",
    "help_start": "시작하기",
    "help_profiles": "프로필",
    "help_filters": "필터",
    "help_roulette": "룰렛 제작기",
    "help_stadium": "스타디움",
    "help_how_title": "기능",
    "help_steps_title": "단계별 안내",
    "help_problem_title": "문제가 생기면",
    "help_start_steps": "1-2-2, 2-2-2 또는 사용자 지정을 선택하세요.|이름을 입력하고 각 플레이어가 가능한 역할을 켜세요.|원하는 규칙을 설정하세요.|팀 생성을 누르세요. 이름 위치는 바뀌지 않습니다.",
    "help_profiles_steps": "프로필을 만들거나 저장된 프로필을 선택하세요.|영웅을 주력, 사용, 플레이, 미사용으로 분류하세요.|프로필 모드를 선택하세요.|플레이어에게 프로필을 연결하세요.",
    "help_filters_steps": "팀을 생성하고 원하는 카드의 필터를 여세요.|영웅 또는 역할 전체를 끄세요.|필터를 닫으면 변경이 그 카드에 저장됩니다.|재추첨하면 역할, 프로필, 차단을 모두 반영합니다.",
    "help_roulette_steps": "형식에서 룰렛 제작기를 선택하세요.|참가할 역할과 영웅을 선택하세요.|각 영웅의 - 와 + 로 칸 수를 정하세요.|룰렛 만들기 후 룰렛 돌리기를 누르세요.",
    "help_stadium_steps": "규칙에서 스타디움 모드를 켜세요.|팀을 생성하세요.|각 카드에 일반 특전 대신 스타디움 파워 4개가 표시됩니다.|빠른 대전으로 돌아가려면 끄세요.",
    "help_roulette_body": "룰렛 제작기는 목록에서 영웅 한 명을 선택합니다. 칸이 많을수록 당첨 확률이 높습니다.",
    "help_roulette_tip": "예: 아나 x4, 겐지 x1이면 총 5칸이며 아나 80%, 겐지 20%입니다.",
    "help_summary": "핵심",
    "no_profile": "프로필 없음",
    "snapshot": "로컬 데이터 · 업데이트 {date}",
    "snapshot_unknown": "로컬 데이터 · 날짜 없음",
    "api_running": "로컬 스냅샷 업데이트 중…",
    "api_cancelling": "업데이트 취소 중…",
    "api_cancelled": "업데이트가 취소되었습니다. 이전 로컬 데이터는 유지되었습니다.",
    "api_done": "데이터가 업데이트되어 새 스냅샷을 사용합니다.",
    "api_failed": "업데이트를 완료하지 못했습니다.",
    "no_candidates": "현재 역할, 프로필 및 필터와 일치하는 조합이 없습니다.",
    "no_alternative": "이 카드에서 선택할 다른 영웅이 없습니다.",
    "image_copied": "결과 카드가 클립보드에 복사되었습니다.",
    "mode_classic": "클래식",
    "mode_allprofile": "분류된 영웅 전체",
    "mode_lowprob": "새 영웅 탐색",
    "mode_practice": "연습",
    "mode_played": "피하기 제외",
    "mode_prefer": "선호 영웅",
    "mode_main": "주 영웅만",
    "profile_locked": "프로필",
    "on": "켜짐",
    "off": "꺼짐",
    "quickplay_label": "빠른 대전",
    "stadium_label": "스타디움",
    "app_title": "무작위 영웅 선택기",
    "header_subtitle": "무작위 영웅 선택기",
    "help_start_body": "1-2-2 또는 2-2-2로 고정 조합을 선택할 수 있습니다. 사용자 지정에서는 1~24명과 1팀 또는 2팀을 설정합니다. 이름 위치는 유지되고 각 플레이어에게 허용된 역할 중에서 무작위로 배정됩니다.",
    "help_profiles_body": "프로필에서 영웅을 주 영웅, 사용함, 연습 중, 피하기로 분류합니다. 플레이어에게 지정하고 모드를 선택하면 분류에 따라 확률과 후보가 달라집니다.",
    "help_filters_body": "각 카드의 필터는 해당 플레이어에게 활성화된 모든 역할을 사용합니다. 영웅 차단, 역할 전체 켜기/끄기, 결과 화면에서 필터 초기화가 가능합니다.",
    "help_stadium_body": "스타디움 지원 영웅만 선택하고 네 개의 파워를 표시합니다. 끄면 일반 빠른 대전 특전으로 돌아갑니다.\n\n7월 16일 업데이트: 이 모드는 이미 죽었습니다 XD",
    "help_start_tip": "형식과 각 플레이어의 역할을 선택한 뒤 “팀 생성”을 누르세요.",
    "help_profiles_tip": "프로필은 후보를 조정하지만 카드의 역할이나 영웅 필터를 무시하지 않습니다.",
    "help_filters_tip": "후보가 적으면 먼저 활성 역할을 확인하고 다음으로 차단된 영웅을 확인하세요.",
    "help_stadium_tip": "이전 스타디움 경기에서만 사용하세요. 빠른 대전에서는 끄는 것을 권장합니다.",
    "mode_classic_help": "프로필을 무시하고 역할과 필터에서 허용된 영웅 중 선택합니다.",
    "mode_allprofile_help": "주 영웅, 사용함, 연습 중, 피하기에서 동일하게 선택합니다. 분류된 후보가 있으면 미지정 영웅은 제외합니다.",
    "mode_lowprob_help": "익숙하지 않은 영웅을 우선합니다: 피하기 8, 연습 중 5, 사용함 3, 주 영웅 1.",
    "mode_practice_help": "연습 중 또는 피하기 영웅만 골라 영웅 폭을 넓힙니다.",
    "mode_played_help": "주 영웅, 사용함, 연습 중에서 선택하고 피하기 영웅은 제외합니다.",
    "mode_prefer_help": "주 영웅과 사용함만 선택합니다.",
    "mode_main_help": "주 영웅만 선택하며 해당 역할에 후보가 없으면 허용된 전체 목록으로 대체합니다."
  }
};

var heroNames = {
  "ja-jp": {
    "ana": "アナ",
    "anran": "アンラン",
    "ashe": "アッシュ",
    "baptiste": "バティスト",
    "bastion": "バスティオン",
    "brigitte": "ブリギッテ",
    "cassidy": "キャスディ",
    "domina": "ドミナ",
    "doomfist": "ドゥームフィスト",
    "dva": "D.Va",
    "echo": "エコー",
    "emre": "エムレ",
    "freja": "フレイヤ",
    "genji": "ゲンジ",
    "hanzo": "ハンゾー",
    "hazard": "ハザード",
    "illari": "イラリー",
    "jetpack-cat": "ジェットパック・キャット",
    "junker-queen": "ジャンカー・クイーン",
    "junkrat": "ジャンクラット",
    "juno": "ジュノ",
    "kiriko": "キリコ",
    "lifeweaver": "ライフウィーバー",
    "lucio": "ルシオ",
    "mauga": "マウガ",
    "mei": "メイ",
    "mercy": "マーシー",
    "mizuki": "ミズキ",
    "moira": "モイラ",
    "orisa": "オリーサ",
    "pharah": "ファラ",
    "ramattra": "ラマットラ",
    "reaper": "リーパー",
    "reinhardt": "ラインハルト",
    "roadhog": "ロードホッグ",
    "shion": "シオン",
    "sierra": "シエラ",
    "sigma": "シグマ",
    "sojourn": "ソジョーン",
    "soldier-76": "ソルジャー76",
    "sombra": "ソンブラ",
    "symmetra": "シンメトラ",
    "torbjorn": "トールビョーン",
    "tracer": "トレーサー",
    "vendetta": "ヴェンデッタ",
    "venture": "ベンチャー",
    "widowmaker": "ウィドウメイカー",
    "winston": "ウィンストン",
    "wrecking-ball": "レッキング・ボール",
    "wuyang": "ウーヤン",
    "zarya": "ザリア",
    "zenyatta": "ゼニヤッタ"
  },
  "pt-br": {
    "junker-queen": "Rainha Junker",
    "soldier-76": "Soldado: 76",
    "lucio": "Lúcio"
  },
  "fr-fr": {
    "mercy": "Ange",
    "wrecking-ball": "Bouldozer",
    "junkrat": "Chacal",
    "roadhog": "Chopper",
    "hazard": "Danger",
    "echo": "Écho",
    "widowmaker": "Fatale",
    "reaper": "Faucheur",
    "lifeweaver": "Vital",
    "junker-queen": "Reine des Junkers",
    "soldier-76": "Soldat : 76"
  },
  "de-de": {
    "domina": "Dominia"
  },
  "ko-kr": {
    "anran": "안란",
    "ashe": "애쉬",
    "bastion": "바스티온",
    "cassidy": "캐서디",
    "echo": "에코",
    "emre": "엠레",
    "freja": "프레야",
    "genji": "겐지",
    "hanzo": "한조",
    "junkrat": "정크랫",
    "mei": "메이",
    "pharah": "파라",
    "reaper": "리퍼",
    "shion": "시온",
    "sierra": "시에라",
    "sojourn": "소전",
    "soldier-76": "솔저: 76",
    "sombra": "솜브라",
    "symmetra": "시메트라",
    "torbjorn": "토르비욘",
    "tracer": "트레이서",
    "vendetta": "벤데타",
    "venture": "벤처",
    "widowmaker": "위도우메이커",
    "ana": "아나",
    "baptiste": "바티스트",
    "brigitte": "브리기테",
    "illari": "일리아리",
    "jetpack-cat": "제트팩 캣",
    "juno": "주노",
    "kiriko": "키리코",
    "lifeweaver": "라이프위버",
    "lucio": "루시우",
    "mercy": "메르시",
    "mizuki": "미즈키",
    "moira": "모이라",
    "wuyang": "우양",
    "zenyatta": "젠야타",
    "dva": "D.Va",
    "domina": "도미나",
    "doomfist": "둠피스트",
    "hazard": "해저드",
    "junker-queen": "정커퀸",
    "mauga": "마우가",
    "orisa": "오리사",
    "ramattra": "라마트라",
    "reinhardt": "라인하르트",
    "roadhog": "로드호그",
    "sigma": "시그마",
    "winston": "윈스턴",
    "wrecking-ball": "레킹볼",
    "zarya": "자리야"
  }
};

var baseHeroItems = {
  "anran": {
    "items": [
      {
        "name": "Smoulder",
        "description": "Ignited enemies burn 1.5 seconds longer.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/5d927315af0a5729ab1be838556dc1e2d9206bbe0fd69bf3c084b64a761c9b12.png",
        "kind": "perk"
      },
      {
        "name": "Heat Shield",
        "description": "Gain 50 overhealth when you use your Ultimate and for each enemy ignited by it.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/52a35ec19286d15384a73910c2763d02774674069f3cfd0ee5681afd545f3c82.png",
        "kind": "perk"
      },
      {
        "name": "Short Fuse",
        "description": "Impacting an enemy with Inferno Rush reduces its cooldown by 1.5 seconds.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/6aedcee19eff304025cefdba8f089cf356293389088f53c8c6f4de11a008ba63.png",
        "kind": "perk"
      },
      {
        "name": "Hungering Blaze",
        "description": "Increase the healing of Dancing Blaze's subsequent strikes by 25.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/110e0b00345b359281b3ae871725d149051bed40fce266435806b4c390729722.png",
        "kind": "perk"
      }
    ]
  },
  "ashe": {
    "items": [
      {
        "name": "Remote Detonator",
        "description": "After using Dynamite, pressing E again causes it to detonate after a 0.5 second delay.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/aa6a6fe0ff9bc45cd066c0938191f02c59b81c97c4b1d74d6de14550894fbf7c.png",
        "kind": "perk"
      },
      {
        "name": "Double-Barreled",
        "description": "Knocking an enemy back with Coach Gun allows you use it one extra time within 2 seconds.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/cb7352dd49a08b2b95183a0ae7ef831f711754167e84968316c72052ec0affe8.png",
        "kind": "perk"
      },
      {
        "name": "Viper's Sting",
        "description": "Hitting 2 consecutive scoped shots on a target deals 25 extra damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/24f39937222b86f1b15717b96ab8b344104a9b69aaca142965d6c8ebc841a5ca.png",
        "kind": "perk"
      },
      {
        "name": "Airburst",
        "description": "Dynamite has a 40% increased detonation radius while airborne and refunds 6 ammo when thrown.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/5c01e6810c9aac8d790e97f6b1e090aef6e89970c16eb9601812332e1cdb8f8f.png",
        "kind": "perk"
      },
      {
        "name": "Reload Therapy",
        "description": "When you reload or restore ammo, heal 5% of your Life.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/f1255ab1db4e66abb1428755bf686c1259c3103805fd386a7deb88b960d98148.png",
        "kind": "power"
      },
      {
        "name": "Fire at My Fingertips",
        "description": "When you deal damage to a Burning enemy with The Viper, restore 1 ammo.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/114d14f2a8d44d872c015b9cbac4ce4cb5c0aaeb933f13c7475610b638a9624f.png",
        "kind": "power"
      },
      {
        "name": "My Business, My Rules",
        "description": "When you deal damage to a Burning enemy with The Viper, reduce the cooldown of your abilities by 10%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/1be75b6f39c022894644d464dc5b2065f7daec19cf5f624c07f4ddfb5608c26f.png",
        "kind": "power"
      },
      {
        "name": "What in Tarnation!?",
        "description": "For 3s after Coach Gun knocks you airborne, Take Aim grants 20% Attack Speed and slows fall speed. If Coach Gun doesn't deal any damage, refund 3s of its cooldown. ",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/6bddc793519071b3c742fd576dbcf58f777aabc33e0ab7e063734bf873c2ec17.png",
        "kind": "power"
      },
      {
        "name": "Calamity",
        "description": "Using Coach Gun restores Ammo equal to 25% of your Max Ammo. The restored shots apply Burning, dealing 40 damage over 3s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/ce5776e3925d26f8ca9b42e11d02f304fc2eec21beb4c3770f851d403b39befa.png",
        "kind": "power"
      },
      {
        "name": "Double Barreled",
        "description": "Coach Gun gains an additional charge.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/b384bd402771ec2204afc1c1767d31b6870a8455ffa8d87986f13e2c4a768f57.png",
        "kind": "power"
      },
      {
        "name": "Slow Burn",
        "description": "While scoped, Critical Damage Burns enemies for 20% extra damage over 3s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/aed1312a191ea147f439afc35928c93fd55bb0c6fe6e8c3a6260416292b89710.png",
        "kind": "power"
      },
      {
        "name": "Controlled Boom",
        "description": "After throwing Dynamite, reactivating the ability causes it to explode after a 0.5s delay. Dynamites that explode mid-air burn for 1s longer.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/4581ded76fa87b12b9e18dcce8628cf228f395bc40d3d71bed85bae5afcfe51c.png",
        "kind": "power"
      },
      {
        "name": "Out with a Bang",
        "description": "When Dynamite explodes, it spawns 3 sticky explosives that deal 50% reduced damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/d5428c05847f5f89b7ef9bdd000b4c5e64e2cf636d1d6db3addd6571329c8019.png",
        "kind": "power"
      },
      {
        "name": "B.O.B. Jr.",
        "description": "B.O.B. costs 50% less Ultimate Charge but has reduced Life, 20% reduced Attack Speed, and is significantly smaller.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/2f31435ca790329f8b17e31f9cea919d71b72e6c34614cca46399192c406cb08.png",
        "kind": "power"
      },
      {
        "name": "Stacked Sticks",
        "description": "Dynamite has 40% increased Blast Radius and burns 40% faster.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/54f3a611d9a5c357cd3655584beb516c8357bd4d93fee197c9557000c3653e4e.png",
        "kind": "power"
      },
      {
        "name": "PinB.O.B.",
        "description": "Ability: After B.O.B. charges, reactivate Ultimate to charge again. (3s Cooldown).­ Eliminations reset the cooldown and add 2s B.O.B. duration.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/b65af4fa80580b39efe647b0294ee6082cab2362ff780b194568af6ea73772df.png",
        "kind": "power"
      }
    ]
  },
  "bastion": {
    "items": [
      {
        "name": "Smart Bomb",
        "description": "A-36 Tactical Grenade's self-knockback is increased by 25% and no longer damages you.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/813550a1cb8390ac118eb81441c1b76bf40bf0ff536cfb2fdb0ed1e8ab53262f.png",
        "kind": "perk"
      },
      {
        "name": "Configuration Reload",
        "description": "Reduce the cooldown of A-36 Tactical Grenade by 4 seconds when changing configurations.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/0e3078ec09e5ad1bf131e3cfd820e6dd7fe0cf568545a7093e0b2b41e019f995.png",
        "kind": "perk"
      },
      {
        "name": "Lindholm Explosives",
        "description": "Configuration: Assault's weapon slowly fires explosive shells instead of a rotary cannon.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/18e73dc037267e2b8e315bbbc76c826360633cc67f16dedeed21a86cd4f7f97e.png",
        "kind": "perk"
      },
      {
        "name": "Self-Repair",
        "description": "Press E to rapidly heal yourself.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/0322e5394e3b67a011c27be4d8c84c0a4f74771d557339ac680dae7edbc3aaf7.png",
        "kind": "perk"
      }
    ]
  },
  "cassidy": {
    "items": [
      {
        "name": "Bang Bang",
        "description": "Cassidy throws a second Flashbang that travels farther, but both Flashbangs deal 40% reduced damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/4cf99ebedab5eb72e47c1388000cb29ad521fb2faf7e7b31f526bbbe3f212632.png",
        "kind": "perk"
      },
      {
        "name": "Even The Odds",
        "description": "Regenerate 40 health per second for each enemy targeted by Deadeye.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/dea10fbc3c905970630c2304ff19f852363cafc4a2b51bdd604c02dfad18e6ab.png",
        "kind": "perk"
      },
      {
        "name": "Rollin' Round-Up",
        "description": "Combat Roll also heals 15 health for each bullet reloaded.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/4eb33f06a39774d03562b84d4541ed691de840de3aedefc18fb6b809a9f01b8f.png",
        "kind": "perk"
      },
      {
        "name": "Silver Bullet",
        "description": "Peacekeeper's secondary fire is replaced with a piercing shot that inflicts bleeding. Combat Roll and Deadeye reset its cooldown.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/383425b058c7a8a60439132ecb199ea59e91be71b7e57835019c28beb7f080a2.png",
        "kind": "perk"
      },
      {
        "name": "Quick Draw",
        "description": "After using Combat Roll, Peacekeeper's next shot can auto-aim within 15m while under cooldown.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/4ccb06c8fa111bf0cbe6d0c7812917df89a44f949601e24844b1fae0c3b89d4e.png",
        "kind": "power"
      },
      {
        "name": "Gunslinger Grit",
        "description": "When you reload or restore ammo, heal 2.5% of your Life for every ammo restored.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/bd952137bedfa40cbf00aaf2fc1b480024ae312f0f0eb259ca07347c5536479d.png",
        "kind": "power"
      },
      {
        "name": "Bullseye",
        "description": "Flashbang hits and Critical hits reduces Combat Roll's cooldown by 2s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/09d3ab70becc8607f1f8fc13b165c98cdbbdbc18e9d9e0ed66e05b93a55b49c1.png",
        "kind": "power"
      },
      {
        "name": "Think Flasht",
        "description": "When you start a Combat Roll, leave a Flashbang behind.­ Flashbang's hinder duration is increased by 25%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/e3dbc1641838bf07f8956245284615d11c27abab2253bc751064d3bfd24516d2.png",
        "kind": "power"
      },
      {
        "name": "Easy Rider",
        "description": "Eliminating an enemy recently damaged by Flashbang grants 20% Ultimate Charge. While using Deadeye, gain 100 Overhealth and 25% Move Speed.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/c54bea63da40df5b702c4434d02e418490e6ecc4cf8db8e9ff2ae95ffa79483f.png",
        "kind": "power"
      },
      {
        "name": "It's Twelve O'Clock Somewhere...",
        "description": "Deadeye eliminations grant 25% Ultimate Charge each. If you get no eliminations with Deadeye, refund 33% Ultimate Charge.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/7863787e78598364b63c8f6d897a558ab64fe0eca21a4c3d32d68e16d82b6cd7.png",
        "kind": "power"
      },
      {
        "name": "Dead Man Walkin'",
        "description": "Enemies below 30% Health have their heads marked. Marked heads are larger and Critical Hits on marked enemies have 50% Weapon Lifesteal.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/26ffd14eaf816a95ff78f96840becf0a0834d3f94b34aa0022691a412c163849.png",
        "kind": "power"
      },
      {
        "name": "Barrage Blastin'",
        "description": "The first time you run out of Ammo while Fan the Hammer is active, immediately reload and continue firing at 60% reduced damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/ae043763d9afe148ec8d886f8873aaa38251035b5648a194fd026881ecca0911.png",
        "kind": "power"
      },
      {
        "name": "Silver Bullet",
        "description": "Fan the Hammer is replaced with Ability: Fire a piercing Peacekeeper shot that deals 50 bonus damage over 2.5s. Cooldown is reset when using an ability or Gadget. ",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/6e780b046146e9084b17f15e7f4088a1449b90ba1b9f0d162eab8de4a6215815.png",
        "kind": "power"
      },
      {
        "name": "Buck Wild",
        "description": "Dealing damage with Peacekeeper grants 1% Move Speed for 5s, stacking up to 15 times. At max stacks, gain 10% Damage Reduction.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/df4d2f7b27b4efdd62715de4094b4436df363324f4af826c307c54c6699dd8a9.png",
        "kind": "power"
      },
      {
        "name": "Barrel Roll",
        "description": "Combat Roll takes you 50% further and deals 65 damage to enemies. ",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/17458e545907a56988b9bd8a60e4a7771b4188bac4eae61abb4b339830170039.png",
        "kind": "power"
      },
      {
        "name": "Hot Potato",
        "description": "Flashbang becomes magnetic and has 125% increased throw distance.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/af404fd5b08ba5d8a1afaa6f5ad69ff92ffce2ad3daf749323f1408f3eb8de9c.png",
        "kind": "power"
      }
    ]
  },
  "echo": {
    "items": [
      {
        "name": "Focused Rush",
        "description": "Focusing Beam's range is increased by 6 meters and movement speed is increased by 20% when active.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/13a06093b579b9a0588d37534cf8fd8f31e3c129f67b3585b58dca171fcdca68.png",
        "kind": "perk"
      },
      {
        "name": "Partial Scan",
        "description": "Duplicate starts with 30% of its ultimate charge.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/150c696d8ec1329c43c139c68729ea408ae03216d41b5e759d5b7648d8584605.png",
        "kind": "perk"
      },
      {
        "name": "Full Salvo",
        "description": "Sticky Bombs fires 2 additional projectiles.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/47a96fff39ffc551e830cd5cb3f3baf424563e9fd263a2779e01eb1bd5a7d8a4.png",
        "kind": "perk"
      },
      {
        "name": "High Beams",
        "description": "Focusing Beam eliminations reset Flight's cooldown.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/0f69d5a737cf6d1fcc7ce70c41fd29dcabcdf2815ad8fa99df136d14f4864c69.png",
        "kind": "perk"
      }
    ]
  },
  "emre": {
    "items": [
      {
        "name": "Suppressive Security",
        "description": "Override Protocol’s light rounds slow enemies by 30% for 1 second.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/241ca51517666e1a6d64dda896c55d67151beab7e7ba1a54936beddb00186261.png",
        "kind": "perk"
      },
      {
        "name": "Enhanced Agility",
        "description": "Siphon Blaster’s movement speed bonus is increased by 20% while not firing.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/0a82995c66a16506c6637fa41deefa87b913bb398126e68091ff308f544d9219.png",
        "kind": "perk"
      },
      {
        "name": "Heat Sink",
        "description": "Direct hits with Siphon Blaster refunds 60% heat and increase its duration by 0.1 seconds.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/be7d093a726667fb18c02a46983edf58dda1e07c1e6b411e202461414d28ccba.png",
        "kind": "perk"
      },
      {
        "name": "Cyber Adhesion",
        "description": "Cyber Frag now sticks on contact, dealing 40 extra damage to stuck enemies.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/c1e486e48f92254734e19a47d63672f81c187bfbcb524f9634fe295ea89d36ee.png",
        "kind": "perk"
      }
    ]
  },
  "freja": {
    "items": [
      {
        "name": "Relentless Barrage",
        "description": "Direct hits with Take Aim refund 8 automatic bolt ammo.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/b4716c0312754221a259f0d7dd2bf04eb3671b8f2bb70692854217403137d0d4.png",
        "kind": "perk"
      },
      {
        "name": "Momentum Boost",
        "description": "Quick Dash distance is increased by 20%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/2444e973875857e2425dfcc64f3aa5de3aba82fe12887134e6cfb38172a074f6.png",
        "kind": "perk"
      },
      {
        "name": "Aerial Recovery",
        "description": "After using Updraft, heal for 30 health per second until Freja touches the ground.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/e374851a1c97f54461526905d9e97b3466ea7ef0c7c592994eb098e404a7ef2a.png",
        "kind": "perk"
      },
      {
        "name": "Rising Winds",
        "description": "Updraft gains an additional charge.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/4ac4daca1df0efba3715a3406834bf8efb379dc636682e7d771377dc5139c3f9.png",
        "kind": "perk"
      },
      {
        "name": "Seismic Shot",
        "description": "Take Aim explosion radius is increased by 50%. Double this if the bolt is stuck to a target.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/422af172da1d52744690dbc8bae61300a2c34129d26b93a215da27eb604ebd82.png",
        "kind": "power"
      },
      {
        "name": "Seekerpoint",
        "description": "When Take Aim bolt sticks an enemy, automatically fire 3 additional crossbow shots at them that deal 66% reduced damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/9dc65ad7c5ed0226bd7430ebaefe65104ca4c13c434d70a2089b5a6f8cb2b34b.png",
        "kind": "power"
      },
      {
        "name": "Redux",
        "description": "Revdraw Crossbow hits against targets stuck by a Take Aim bolt or Bola Shot reduce the cooldown of your abilities by 5% and refunds 1 ammo.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/b3c6301a9855bccbf9955d6522c80664c6709d71374c65a1931ad75fb74e8369.png",
        "kind": "power"
      },
      {
        "name": "Cyclone",
        "description": "When you use Updraft, fire a ­ Take Aim bolt that deals 25% reduced explosion damage at your crosshair.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/181f84fc81ec407587f0dcb2cf0c877a01de0dd9582a718da514597d72f8c104.png",
        "kind": "power"
      },
      {
        "name": "Peak Performance",
        "description": "+20% Updraft Height­ While firing Revdraw Crossbow, your fall speed is decreased by 80%.­ While Airborne, gain 20% increased Move Speed.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/befb5192944cae19e1e075f14a423fbbadb27f01c719185328cefd157f1c6d25.png",
        "kind": "power"
      },
      {
        "name": "Deep Pockets",
        "description": "When you use an ability, restore 30% of your Max Ammo.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/a43e147eb9ce28f922bfd5a4d1c997964740132d664adea49e35bc5073328e54.png",
        "kind": "power"
      },
      {
        "name": "Volley à Deux",
        "description": "Every 3rd Revdraw Crossbow shot fires an additional 2 bolts in a spread that deal 60% reduced damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/2e8740695b20a53cbac3b922599ea7e19924cec21fc057d188ca250a6d7702be.png",
        "kind": "power"
      },
      {
        "name": "Forager",
        "description": "For 2s after using Quick Dash, Revdraw Crossbow hits heal you for 4% of your Max Life. ",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/bfefff2e9c2aa39a3b861a7b596fa40db26032cf701a6e15172b40c14d5692b2.png",
        "kind": "power"
      },
      {
        "name": "Lille Fælde",
        "description": "After using Updraft, your next Take Aim while airborne instead fires a mini Bola Shot that no longer pulls and has 40% reduced effectiveness.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/f67d465e264ade6ba4964445010ab00bfc684dbf772b6e14e99543e38d151b81.png",
        "kind": "power"
      },
      {
        "name": "Mighty Gust",
        "description": "Updraft launches a wind blast towards your crosshair, knocking back enemies and dealing 60 damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/33c8d20460110d2b15a227fd44bea0597183c9db404d890f46410d85a70c1dae.png",
        "kind": "power"
      },
      {
        "name": "So Cooked",
        "description": "Bola Shot's damaging zone deals 20% more damage and lingers for 2s.­ Bola Shot eliminations count towards Bounty Hunting.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/087dd8d14ceb02b0b7116955406270e8eca46fd406455039be932c8d86737906.png",
        "kind": "power"
      },
      {
        "name": "Thread The Needle",
        "description": "Take Aim bolts pierces the first enemy hit. Additional explosions deal 66% reduced damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/ac9b19ef68ee7b90470b15eb6ba36d8f9d47f596365a5d44112373755ee53222.png",
        "kind": "power"
      }
    ]
  },
  "genji": {
    "items": [
      {
        "name": "Swift Cuts",
        "description": "Quick Melee reduces the cooldown of Swift Strike by 3 seconds.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/72c205ea67dbe8dad29066f1b63b9377fe269eb134a2d58c203c16ed9e641f0c.png",
        "kind": "perk"
      },
      {
        "name": "Dragon's Thirst",
        "description": "Dragonblade swings gain 30% lifesteal.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/8eaca93d060776d4d3204338656e0aaad85afeeae516d21e47ccfc91aae4efde.png",
        "kind": "perk"
      },
      {
        "name": "Blade Twisting",
        "description": "Swift Strike deals 25 additional damage over time if the enemy is below half health.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/abcef6f42d1803faa1442b14f351ba1165f93c993e8530145d165e43419dda1d.png",
        "kind": "perk"
      },
      {
        "name": "Meditation",
        "description": "Regenerate 50 health per second while Deflect is active.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/f6046ca3bc6b1dde0cece4f255b2e30eba0ef50aecff6ecfbe3858b0ee7cc4c2.png",
        "kind": "perk"
      },
      {
        "name": "Sacred Shuriken",
        "description": "+50% Shuriken Primary Fire Projectile Speed­ Shuriken's primary fire throws 2 additional Shuriken that don't consume any ammo.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/ff58ae37ebc99a62deb1f919250d2d70fdee6d1a0a3d07a81465b33817667ec6.png",
        "kind": "power"
      },
      {
        "name": "Hanamura Healing",
        "description": "Critical hits and Swift Strike grant Overhealth equal to 25% of their damage dealt.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/1c6988e458c07ce31ecc2206503ef329c1845c59ab6bf41b593e1b1e85da9f49.png",
        "kind": "power"
      },
      {
        "name": "Cybernetic Speed",
        "description": "Dealing damage with Shuriken grants 3% Shuriken Attack Speed for 3s, stacking up to 15 times.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/32abd8a6c5989ddb8a01ac80cb497ef3a2894f9d4e726647d0ca4087892daa02.png",
        "kind": "power"
      },
      {
        "name": "Wyrm's Maw",
        "description": "After dealing Shuriken damage, your next Swift Strike gains 10% damage and 5% range, stacking up to 5 times.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/ddfaf3f3d72fa4fa0d1bebf3182de630a774217555a8ec6718bc8cd8006e6f74.png",
        "kind": "power"
      },
      {
        "name": "Iaido Strike",
        "description": "After Deflect ends, quickly swing your Dragonblade once with 75% effectiveness.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/e04ec03f8c11222d97d96158425e68eed88863b54bde5c0423017252b332c41d.png",
        "kind": "power"
      },
      {
        "name": "Hidden Blade",
        "description": "Gain 60% Melee Lifesteal and increase Quick Melee damage by 15.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/e0ac7af317bdf42cbcba2867a9e492a66895bee10580ffed7789d169ade2c56e.png",
        "kind": "power"
      },
      {
        "name": "Forged Under Fire",
        "description": "While Deflect is active, heal for 100% of the damage it prevents.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/6da8104fd4267ac8dbacd0de91fa71e946c8e312efd591f66ff3e5f35a801d9b.png",
        "kind": "power"
      },
      {
        "name": "Laceration",
        "description": "Swift Strike deals 30% additional damage over 3s.­ For each enemy Swift Strike damages beyond the initial target, reduce Swift Strike cooldown by 2s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/b123983dc94de25a8585bfbecf8ecbc592fd60a925632bae5422d0647a029308.png",
        "kind": "power"
      },
      {
        "name": "Deflect-o-Bot",
        "description": "+200% Deflected Projectile Speed.­ Automatically deflect projectiles towards enemies. During the first 0.3s of Deflect, deflected hits will deal 50% bonus critical damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/777239b5a2be3033c95daced0dcada23ecb3cd061cdd78e6f08cdee95e93a90b.png",
        "kind": "power"
      },
      {
        "name": "Hashimoto's Bane",
        "description": "After using an ability, your next secondary fire throws 2 extra Shuriken that seek enemies but deal 50% less damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/0ec96860c9d8012a53f626c94aebd2c19938782fba4d325933513876cfb654d8.png",
        "kind": "power"
      },
      {
        "name": "Dragon's Breath",
        "description": "Dragonblade swings launch a large piercing projectile that deals 100% of Dragonblade's damage and deals 25% increasd damage to Airborne enemies.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/775a926133c6c037df6d54a278663ec8798a6a5455bb1f4eb8387b7058d83cd6.png",
        "kind": "power"
      },
      {
        "name": "Spirit of Sojiro",
        "description": "+1s Deflect Duration­ Deflect now deflects attacks from both sides.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/69dd84b758c336eee4b009b068b217b8c9e0103d41b6357a83382926b7c97267.png",
        "kind": "power"
      }
    ]
  },
  "hanzo": {
    "items": [
      {
        "name": "Sonic Disruption",
        "description": "Sonic Arrow hacks nearby Health Packs for 30 seconds.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/87e55e35423446812982cb7bb692f2ae1f3f344b9eff67240468c3eb884bad87.png",
        "kind": "perk"
      },
      {
        "name": "Dragon Fury",
        "description": "After hitting an enemy with Primary Fire, gain 20% attack speed for 1.5 seconds.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/19a87e5ad2913df72cfb62ab905bd15328ef6b02a6aa4beb15fe37337f3d69ad.png",
        "kind": "perk"
      },
      {
        "name": "Frost Arrow",
        "description": "Press R to ready an explosive frost arrow, slowing enemies hit by 35% for 2 seconds.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/73b91f4b7b4e7b5250ff1e7c1e027bb3a543fce82d607e3363d1cca2771fc83d.png",
        "kind": "perk"
      },
      {
        "name": "Scatter Arrows",
        "description": "On first ricochet, Storm Arrows split into 5 shots dealing 33% damage and bounce 1 extra time.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/32b18f33f63e27446cb66662a1e26ec9fff6456bbfe75e17634174ca44885c14.png",
        "kind": "perk"
      }
    ]
  },
  "junkrat": {
    "items": [
      {
        "name": "Nitro Boost",
        "description": "During RIP-Tire, use LSHIFT to gain a quick boost of speed. Doing so reduces RIP-Tire's damage by 50%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/150e4b3594f8ddc25eca19a90f39ca146c9dfcd5449e7538c5c131ee15b2277b.png",
        "kind": "perk"
      },
      {
        "name": "Bomb Voyage",
        "description": "After launching with Concussion Mine, Junkrat gains 35% increased attack speed for 3 seconds.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/11b40305e441dbcdfcd86232e84758683d290f13ef0d28fe9dc7e0c3aa8d3d24.png",
        "kind": "perk"
      },
      {
        "name": "Mine Recycling",
        "description": "Eliminations with Concussion Mine restore one charge.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/76e4650ee601f21fa966ff326d80366271d862199f7250edaafa9033aa29e236.png",
        "kind": "perk"
      },
      {
        "name": "Frag Cannon",
        "description": "Frag Launcher's projectile speed is increased by 25%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/046617c7617e09bec3445e0b3059d6157f1bdabe842650ec2ed3962634a52da0.png",
        "kind": "perk"
      },
      {
        "name": "Frags For Days",
        "description": "Frag Launcher has a 25% chance to shoot an additional projectile that deals 66% reduced damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/045ad1eab1747bcbf939888d65950b062043990fbd6f14bcc5a383138df6b6b5.png",
        "kind": "power"
      },
      {
        "name": "Big Bang",
        "description": "When a Frag Launcher shot bounces, increase its projectile size by 33%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/d03530ed625ee7312caf51ecff3efaa02af797ae28a3a8b46e9156781630c5c8.png",
        "kind": "power"
      },
      {
        "name": "Soot Shaker",
        "description": "After detonating Concussion Mine, gain 15% increased Attack Speed for 1.5s and restore 20% Max Ammo.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/2534a571a7dda215a287f5cd4c3d5d629ba1f7453a5a1cb6271784de386c764e.png",
        "kind": "power"
      },
      {
        "name": "Bango!",
        "description": "Frag Launcher Direct Hits without bouncing Burn for 20% additional damage over 2s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/b3421b948efbaa496f196227c20ef0791fb97f7426c0f58ef6c68ca766f4fe72.png",
        "kind": "power"
      },
      {
        "name": "Double Trouble",
        "description": "Gain 1 additional charge of Steel Trap. ",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/900ec13da0c6d74630f918f575df482e94f9d58af724c99c3dc79a53fa30a5fd.png",
        "kind": "power"
      },
      {
        "name": "Trap II, Esquire",
        "description": "Detonating a Concussion Mine spawns a mini Steel Trap that slows instead of immobilizing. You can spawn up to 5 mini Steel Traps.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/45cff6098d32df05d15f075877e88fad88b16e530adcb406bf6d355f9be3ddeb.png",
        "kind": "power"
      },
      {
        "name": "Hop Boom",
        "description": "After launching yourself with Concussion Mine, detonate a Concussion Mine wherever you land with 20% reduced  effectiveness.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/7d3ad2634cc0e4b6352558f56d3626e1f49ebe00e1fe05d188a60cfed6ea521d.png",
        "kind": "power"
      },
      {
        "name": "Slapnel",
        "description": "Ability: Quick Melee detonates a Concussion Mine dealing 20% damage, launching you and knocking targets back.­ (8s Cooldown).",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/20257d5c8010c9cfe0d00dee3efacb788be3347efe0354555deb43d2dcb4b000.png",
        "kind": "power"
      },
      {
        "name": "Rainin' Lead",
        "description": "+25% Total Mayhem Explosion Radius.­ After launching yourself, drop 1 Total Mayhem bomb with 25% reduced damage every 0.35s while airborne.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/5f907ab7da362de8998ad1218b023278dd7c88958d9035648f235b89ff32043c.png",
        "kind": "power"
      },
      {
        "name": "Rip Roll",
        "description": "+20% Ultimate Cost Reduction.­ During your ultimate, enter your Rip Tire. Launch out and trigger Total Mayhem when it is destroyed or detonated.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/b854d475475dcfeb157ebc76213c9f09bccf363fab316b0ceff474dc8756c223.png",
        "kind": "power"
      },
      {
        "name": "Successful Heist",
        "description": "For each target hit by Concussion Mine detonation, reduce Concussion Mine's cooldown by 0.5s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/57da8250a65def62e235b148507badf4349254d10a0b7cd192c99598de28b86e.png",
        "kind": "power"
      },
      {
        "name": "Zip Grease",
        "description": "After detonating Concussion Mine, your next Frag Launcher shot gains 200% Projectile Speed and deal 25% increased damage to Airborne enemies.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/b10668ffe64f6a80c3d32539c47d8e9b95dc10d7d02d46201aeb8d880bf3b9f2.png",
        "kind": "power"
      }
    ]
  },
  "mei": {
    "items": [
      {
        "name": "Skating Rink",
        "description": "Allies within Blizzard gain 25% increased movement speed and heal for 50 health per second.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/10f6bf7a34140e74cf639ae596ccaaf4a84d2850f7b4058662a922ce45c58515.png",
        "kind": "perk"
      },
      {
        "name": "Glacial Propulsion",
        "description": "Double jumping creates a small ice pillar that launches Mei into the air.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/55f25d042e203d5c4fb858df4caadd51875b51d7344e0c7e49427eaf64c61229.png",
        "kind": "perk"
      },
      {
        "name": "Deep Freeze",
        "description": "Continuously hitting enemies with primary fire freezes them for a short time.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/e6241c9fb1a5cfd31085dd1a5ab417a6ad29904d75989f7718aa417b390126e6.png",
        "kind": "perk"
      },
      {
        "name": "Cryo-Storm",
        "description": "Cryo-Freeze slows and deals 70 damage per second to nearby enemies.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/6d0f58c3d4df90c6562b381a584da6608beef0826e03d34a0bcf7b964afaff3a.png",
        "kind": "perk"
      },
      {
        "name": "Permafrost",
        "description": "For every 1% of your Ability Power, gain 0.5 increased Max Life.  ",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/53cffe2b3a818e503c385a20a485c715f3e7cfc99c4b18546f69f8e3bd3e8faa.png",
        "kind": "power"
      },
      {
        "name": "Slowball",
        "description": "After using an ability or Gadget, your next 2 Icicle shots fire a snowball with 200% projectile speed that applies 30% slow on hit. ",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/b88c9b2118a92bb21a6157b92a38a896bf632f4d8b0a1f70d6bae4a7ab7d518a.png",
        "kind": "power"
      },
      {
        "name": "Extendothermics",
        "description": "Endothermic Blaster's primary fire range is increased by 6m.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/dfbcc1815aa62d17383ceaf4575e6df83059dfe0d739ab6a10c510609a29c60c.png",
        "kind": "power"
      },
      {
        "name": "Frost Armor",
        "description": "Gain Armor equal to 3% of the damage you deal with ­ Endothermic Blaster's primary fire, up to 100, until the end of the round.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/5175496e8f287ba04c10c82777d9f9ed19f6c5e39e5ad78c7f3fd408310e5890.png",
        "kind": "power"
      },
      {
        "name": "Snowball Flight",
        "description": "Ability: Jumping while mid-air creates a large Ice Wall pillar under you.\n(12s Cooldown).",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/0ac86765d1c4cfa3946615ec1e075ae7f78f3e0563aab22e411c20ca8a32a7c8.png",
        "kind": "power"
      },
      {
        "name": "Twice As Ice",
        "description": "When you use Cryo-Freeze, reset the next cooldown of Ice Wall.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/1018fad9222046513818d476aa6ae4875d9c6da0c7f43267147da0baff0bf27f.png",
        "kind": "power"
      },
      {
        "name": "Iceberg",
        "description": "Ice Wall spawns a mini Blizzard that slows enemies.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/66385bc148013cf66fa1d02eb21c8c3d6ae078960764b77c5f14270e5ea42598.png",
        "kind": "power"
      },
      {
        "name": "Cryclone",
        "description": "Cryo-Freeze spawns a mini Blizzard that slows enemies.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/8b8bfc1207d4d2ee8ae43ab18d76a07bcc2c2ee2cbb2bd0ee85e9d2ef2a109de.png",
        "kind": "power"
      },
      {
        "name": "Coulder",
        "description": "Cryo-Freeze now encases you in a rolling iceball that can knock back enemies and deal 20 damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/410ec3813ebe44e65b9ebe3e6299a878c9ea37419f9a38fbe5e335809d73d2c9.png",
        "kind": "power"
      },
      {
        "name": "Frost Nova",
        "description": "When Cryo-Freeze ends, knock back nearby enemies, dealing 60 damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/bf3631ac70ad42ccdf2b1cadeba1a10d676c7fbb3634d586e9698c393f6451af.png",
        "kind": "power"
      },
      {
        "name": "Frosting",
        "description": "Allies within Blizzard heal for 8% of your Max Life every 1s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/0b9ae24d685568ea520cce7b820a9f3ca326a124c5592531f119fcacffa47992.png",
        "kind": "power"
      },
      {
        "name": "Deep Chills",
        "description": "Continuously hitting an enemy with Endothermic Blaster's primary fire will Freeze them for 0.65s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/dc181318114528a512d98f1ea566774493bebe273a0f6d038784752758b327c7.png",
        "kind": "power"
      }
    ]
  },
  "pharah": {
    "items": [
      {
        "name": "Concussive Force",
        "description": "Concussive Blast deals up to 30 explosion damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/f539cb6ea0b24ef0edd895d2d734d3fb2bc85345c1c5371c5987f92e784eb82e.png",
        "kind": "perk"
      },
      {
        "name": "Helix Shields",
        "description": "Convert 125 health to shields. Direct hits with the Rocket Launcher triggers passive shield regeneration.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/4136731c24d8b49678a8a9def5f5d3e5f7e3c5897cd9c151c1409dbdead93f71.png",
        "kind": "perk"
      },
      {
        "name": "Fuel Stores",
        "description": "Jet Dash grants 50% fuel. Maximum overfuel is increased by 100%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/1b28fe153dc36c6b379ff6793420d280d5ce16bb855188cd35b6f078393cb134.png",
        "kind": "perk"
      },
      {
        "name": "Rocket Salvo",
        "description": "After using a movement ability, your next primary fire also shoots two spiraling mini-rockets, each exploding for 30 damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/34efa97b9ef729fabe003953ca7e5e33e23d07c07c37aee8a6ffa4c5a88cf6bd.png",
        "kind": "perk"
      },
      {
        "name": "Evasive Maneuvers",
        "description": "After using Jump Jet, Concussive Blast gains homing and hinders enemies for 1.5s on direct hit.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/34a745e69280799e7c44edf47cbe0a4238c80c74efeb83cd8ead38a8f50cead8.png",
        "kind": "power"
      },
      {
        "name": "Carpet Bomb",
        "description": "+40% Barrage Move Speed.­ Barrage has 50% increased duration.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/99a8dc9a1d931b996faa9faf57ec5a82e66e49dcc27a115d6d62896de0bd43ab.png",
        "kind": "power"
      },
      {
        "name": "Cyclic Salvo",
        "description": "Rocket Launcher direct hits grant 10 fuel and reduce your cooldowns by 1s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/ae18f8081eec65564f99c15ee2940a69f7ab92e868bc64f0eaa7d07bf612b165.png",
        "kind": "power"
      },
      {
        "name": "Blitz Barrage",
        "description": "+40% Barrage Move Speed.­ After using Jet Dash, fire a Barrage with 75% fewer Mini-Rockets.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/de064364874d3426903a33ad9962d69cf42cddace4aec7744b708a36b52b5e2d.png",
        "kind": "power"
      },
      {
        "name": "Fuel Depot",
        "description": "Rocket Launcher direct hits permanently increase your maximum fuel by 2, stacking up to 25 times.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/25b27786ca34dec379d8a1b3a06dd886b7ae936b936008053549a47d0fdc3cfc.png",
        "kind": "power"
      },
      {
        "name": "Nosedive",
        "description": "Ability: While Airborne, use Crouch to dash towards the ground and restore 50% fuel. ­ (6s Cooldown).",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/dd7b9bc9810abd5a3a1c6b2c24ba8fa23675934e0292937e10ed729aed5f0094.png",
        "kind": "power"
      },
      {
        "name": "Heat Seekers",
        "description": "After using Jet Dash, your next Primary Fire locks onto enemies.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/cfd26d7e2c3553467a67feb614b9c2ff7fd41d296a3a5b8701bec09c7556d58c.png",
        "kind": "power"
      },
      {
        "name": "Launch Vector",
        "description": "Whenever you knockback an enemy with Concussive Blast, fire 3 homing Mini-Rockets at them.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/e441bfb4d4e38ffa02c9a3cc5aff6b4db8373b196fe83839c17b6691dfab803f.png",
        "kind": "power"
      },
      {
        "name": "Speed Kills",
        "description": "Dealing Weapon Damage grants 5% Move Speed and 3% Attack Speed for 3s, stacking up to 6 times. Direct hits grant double stacks.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/b8f0df7980a9ec685e54f02ca80d887ebacff11e1cf502a0d6ae3ceb2df38175.png",
        "kind": "power"
      },
      {
        "name": "Triple Volley",
        "description": "After using an ability or Gadget, your next Primary Fire fires 3 rockets that each deal 40% damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/03f0cfc7a8abeded4d20985304781e868c158302e314457bc3348e98d0ffa748.png",
        "kind": "power"
      },
      {
        "name": "Recursion Battery",
        "description": "Mini-Rockets gain 25% Ability Lifesteal.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/48240797b64ef890b684f21487e5ec77370fc1edb96f9d8684e0a2ea510a240d.png",
        "kind": "power"
      },
      {
        "name": "Extra Charge",
        "description": "Concussive Blast gains 1 extra charge.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/b334d134253f6adb7fd093ad9c8b56ca9baa93a20172cde9fee5f6f9a92c47f5.png",
        "kind": "power"
      }
    ]
  },
  "reaper": {
    "items": [
      {
        "name": "Soul Reaving",
        "description": "Collect Soul Globes from dead enemies to restore 50 health.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/703054950487245c1a60a25bf65e8301d6050559e5216c17f4970c1adc46fd0b.png",
        "kind": "perk"
      },
      {
        "name": "Lingering Wraith",
        "description": "Leaving Wraith Form grants 30% movement speed for 2 seconds.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/6fe85e04ebeacfca484fbd776da1bf7935102577c30a5d9e9b12ad7e859cc415.png",
        "kind": "perk"
      },
      {
        "name": "Shadow Blink",
        "description": "Shadow Step's cast time and cooldown are 25% faster, but the range is reduced by 25%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/ad2d66c3c90bb3b92e262998d99f3ff30cc9b917205339cb59a4e13f8e23fa33.png",
        "kind": "perk"
      },
      {
        "name": "Trigger Finger",
        "description": "Refresh Dire Triggers' cooldown whenever using an ability or reloading.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/668cd4b407c22f66b8c0f703c352293542dce4d6e0535efd2fb4f2123ff8ed1a.png",
        "kind": "perk"
      },
      {
        "name": "Revolving Ruin",
        "description": "Close-range (7m) Hellfire Shotgun hits grant 5% Attack Speed for 1s, stacking up to 10 times.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/ffb30449223d8f77bb45fb8cc1be7f44f841c30b333ab87d16f3ea1a09cb0f9e.png",
        "kind": "power"
      },
      {
        "name": "Shrouded Shrapnel",
        "description": "Using Wraith Form increases the number of pellets per shot in your next magazine by 25% and its spread by 50%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/4212b97a0bf87564e2a18341eb3b8c41600aab51bad289abe039bde8264b6df2.png",
        "kind": "power"
      },
      {
        "name": "Death Step",
        "description": "After using Shadow Step, cast Death Blossom for 1.5s with 50% reduced damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/881d32044aa8f33ef1e622b0936bff1ef8590fc2d164654908a1a2086a088263.png",
        "kind": "power"
      },
      {
        "name": "Strangle Step",
        "description": "+15% Shadow Step Cast Speed.­ After using Shadow Step, double your Lifesteal for 3s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/3c79a6f011f261011471d9d63906527568c519ad10faa52c3f48d314b05c5f7d.png",
        "kind": "power"
      },
      {
        "name": "Spirited To Slay",
        "description": "Eliminations reduce the cooldown­ of Wraith Form by 50% and Shadow Step by 100%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/458db7a6dc8fe64bdd3d9f650b362cf2b48fad1a468d0efd58f2b7282221bc11.png",
        "kind": "power"
      },
      {
        "name": "Bloodletters",
        "description": "Dire Trigger deals 30 additional damage over 3s to Airborne enemies and to enemies beyond 8m.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/9c4ea7adc04dd8256c2be213f4d86429b4117784dedd65d30f20860b2b5542bd.png",
        "kind": "power"
      },
      {
        "name": "Wraith Renewal",
        "description": "While in Wraith Form, restore 7% of your Life every second. Double this while below 50% Life.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/810b8f9e6ce620ee35ce8b590325a183fa1443d18b8a06ba9c5a1dad7b180bed.png",
        "kind": "power"
      },
      {
        "name": "Hellshroud",
        "description": "While in Wraith Form, passing through enemies Burns them for 20% of your Max Life and slows their Move Speed and Attack Speed by 20% for 2s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/892a7a858c2ed34731e9cb0edb20fc6778c378ac2475f6a32b37f00bc8ecf7d7.png",
        "kind": "power"
      },
      {
        "name": "Wall of Life and Death",
        "description": "While in Wraith Form, become 50% larger and block incoming projectiles while healing all other allies within 6m for 35 every 1s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/608bbc6dcb36493c34ba08765457cf1758d3e073e57d5dbf83f12adf2e41eb20.png",
        "kind": "power"
      },
      {
        "name": "Harvest Fest",
        "description": "Hellfire Shotgun hits have a 20% chance to spawn a Soul Globe. When picked up, restore 15% Life, 15% Ammo, and gain 15% Move Speed for 3s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/a1a8c5becf81576225c3c08bf3a8f5dd20cc99eec770d6ac2818014a9e66a0b5.png",
        "kind": "power"
      },
      {
        "name": "Trigger Finger",
        "description": "After using an ability or Gadget or reloading, refresh Dire Triggers cooldown.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/823b0e601f775ee0b679591fe298bc6f0da8720ad4bab0da1ac25dfa03dcbcc7.png",
        "kind": "power"
      },
      {
        "name": "Wretched Wings",
        "description": "While using Wraith Form, gain the ability to fly.­ While airborne, Jump to glide.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/bb4583f36b2e1ffe3262accc8454bb365e8c6fae00a527a7dc58f6062d123be5.png",
        "kind": "power"
      }
    ]
  },
  "shion": {
    "items": [
      {
        "name": "Rapid Reload",
        "description": "Evade reloads 9 ammo.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/89b16eb9226b933934040d80842d3bf395e058d7bfebc98f71250ddfcd86e2a4.png",
        "kind": "perk"
      },
      {
        "name": "X Machina",
        "description": "Execution does 20% more damage to enemies below half health.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/7d496f8a59eb6f13d661bc282be234e96a683862347777ec7281a92516b8bb1c.png",
        "kind": "perk"
      },
      {
        "name": "Refuel",
        "description": "Joyride instantly restores 50 health and regenerates 20 health per second while active.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/ef825e7cd91405f38bb5e0400b9d20162a01fa81e726d574528a0d3ef3812abc.png",
        "kind": "perk"
      },
      {
        "name": "Faces of Death",
        "description": "Gain all other Damage subrole passives (Recon, Specialist, and Sharpshooter).",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/60e45c630f647bf5b254bb31b02c2597b8d7ace1e7444b05357b694dac3a1d54.png",
        "kind": "perk"
      }
    ]
  },
  "sierra": {
    "items": [
      {
        "name": "Full Flight",
        "description": "Increase Anchor Drone flight and grapple ranges by 25%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/87310bf39feb0d3fb4d672e3f4a78a212c678971301fc33abc5bf619431474f9.png",
        "kind": "perk"
      },
      {
        "name": "Tight Grip",
        "description": "Helix Rifle's bullet spread tightens 70% faster and widens 30% slower.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/b61cf59f034272059a12bc580f5554c80cada3d3efb58bd2a50b6422f8dd228f.png",
        "kind": "perk"
      },
      {
        "name": "Medi-Drone",
        "description": "Anchor Drones hold a medkit that can heal Sierra.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/40bee6462dc1424e2a7b0edf20ed84689f3ea5729d41377187a257982524e818.png",
        "kind": "perk"
      },
      {
        "name": "Locked In",
        "description": "Hitting an enemy with Tracking Shot increases your attack speed by 20% for 2 seconds.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/656d1dee1ba31c2433d36512c973f0958231dae8dcfc70226c16497819ddc65f.png",
        "kind": "perk"
      }
    ]
  },
  "sojourn": {
    "items": [
      {
        "name": "Overcharged",
        "description": "Railgun's maximum energy is increased by 50 while Overclock is active.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/5e3658d0e7ce5ab2941fad17e8201fc2f658db8554d7f83c114bafcbc54740b8.png",
        "kind": "perk"
      },
      {
        "name": "Deceleration Field",
        "description": "Enemies hit by Disruptor Shot are slowed by 25%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/f9a050171b880b1cba0411bfd11eb0739f3d06bf579dd5f3e9cfc9ed767d05e5.png",
        "kind": "perk"
      },
      {
        "name": "Friction Generators",
        "description": "Power Slide generates up to 75 energy.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/26003dd94835d340f1045db8be6b5342b23790e73bb13d258748d6fe86af8a8e.png",
        "kind": "perk"
      },
      {
        "name": "Dual Thrusters",
        "description": "Power Slide gains an additional charge and its jump height shifts to lateral movement.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/78ec26ed402e4ea8a1a2cafcbab9759f35886d3d529c7fa653527cd554f2ed9f.png",
        "kind": "perk"
      },
      {
        "name": "Unconventional Tactics",
        "description": "Power Slide spawns a mini Disruptor Shot when you start sliding and when you jump out of Power Slide.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/b09ea5ddba308a071a2fb62cde17b9caeafbe3576733b182addaf963b05945ae.png",
        "kind": "power"
      },
      {
        "name": "Commotion Cycle",
        "description": "Dealing damage with Charged Shot refunds up to 35% of your ability cooldowns, based on the Railgun Charge spent.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/8bc51d248bfccce49b6e21f1418cc7bc3c1c5c057cb149692bc5a1982ad95b63.png",
        "kind": "power"
      },
      {
        "name": "Experimental Tech",
        "description": "Disruptor Shot slows enemies within its area for 25%. Gain Railgun Charge equal to 50% of ability damage dealt.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/4f4d25d0eb022dc5f11f15cca2bcd2b2ff94c537fadca995f6bdd262a88be445.png",
        "kind": "power"
      },
      {
        "name": "Overcharge",
        "description": "Maximum Railgun Charge increased to 150. Fully-charged attacks and abilities still only consume up to 100 Charge.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/18db9d2ee9d5023833f458602b432eaf740ce642a0f967b74adf66dc1778e662.png",
        "kind": "power"
      },
      {
        "name": "Fine-Tuned Thrusters",
        "description": "+1s Power Slide Duration.­ Eliminations reset Power Slide cooldown. ",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/33a09c097ece67d9cbc3aa79738cb0b0c2c9d9cb0cfee549d8fd20cf54e3f677.png",
        "kind": "power"
      },
      {
        "name": "Drill Kick",
        "description": "+50% Power Slide Speed.­ During Power Slide, gain 25% Damage Reduction and deal 75 damage to nearby enemies. ",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/82802d86570595f9dbe56804bb0f820a2f89e0ed855c4757b567ca954d88e201.png",
        "kind": "power"
      },
      {
        "name": "Hard Stuck",
        "description": "Disruptor Shot can stick to enemies. Stuck Disruptor Shots deal 25% less damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/e29601a10dc6c03a12c422f38d4a535747301cbe19a37ff4570961890a3227d3.png",
        "kind": "power"
      },
      {
        "name": "Enhanced Targeting System",
        "description": "During Overclock, Railgun's Primary Fire auto-aims at enemies.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/35d8784724fd574b1c6db596e51f08fdeb0cbfefe6b05c8afe3488e162f8f394.png",
        "kind": "power"
      },
      {
        "name": "Dynamic Dispatch",
        "description": "During Power Slide and the jump after, gain 50% Charged Shot projectile size, 35% Attack Speed, and 35% Weapon Lifesteal.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/491c1b71b418e7b22db1beae375902772bb1ee7c130553f8a9ccfdbf8f3a4e11.png",
        "kind": "power"
      },
      {
        "name": "Aftershock",
        "description": "Fully-charged Charged Shot or Charged Shot critical hits trigger an explosion, dealing 50% damage to other nearby enemies.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/92edb0a3da05bd93a8b735964f2e7dbf0a2cb29390840ab7d1d039c8396915ba.png",
        "kind": "power"
      },
      {
        "name": "Zoom Zoom Zoom",
        "description": "Gain an additional Power Slide charge.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/be3e430a385142ba4dbd04137235d86edda1ecfb23eddd73a0cf73fec746e102.png",
        "kind": "power"
      },
      {
        "name": "Conductor Chase",
        "description": "During Power Slide and the jump after, gain 10% Railgun Charge and restore 50% of your Max Ammo every 1s. Railgun Charge decays 75% slower.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/7183b259bf742aeb428d966f00ec402c3fdcb6fe7422933c4955bec641f1bcea.png",
        "kind": "power"
      }
    ]
  },
  "soldier-76": {
    "items": [
      {
        "name": "Helix Propulsion",
        "description": "Helix Rockets' projectile speed is increased by 50%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/f3edf6d186c45e6e380ea7402199287e9724390b8b48f6702687ab6f18f47655.png",
        "kind": "perk"
      },
      {
        "name": "Tactical Salvo",
        "description": "During Tactical Visor, Helix Rockets' cooldown is reduced by 80% and no longer interrupts firing Heavy Pulse Rifle.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/c2b0f0b31aa7064f89843efe9f3d4a1ed47b235e9727a925b8a268c6981ddf57.png",
        "kind": "perk"
      },
      {
        "name": "Full Stride",
        "description": "Sprint's movement speed bonus gradually increases by an additional 25% over 2 seconds.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/062d822ee3836054bd987c73831c74c87f9e18ce74b7ceec14e0450d582aa524.png",
        "kind": "perk"
      },
      {
        "name": "Stim Pack",
        "description": "Stim Pack replaces Biotic Field. On use, Soldier: 76 heals for 30 health per second and gains 20% increased attack speed for 5 seconds.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/534498771c3a5a981a3d3f8c2f55df2998753e791f2fd77b51ac95fe501edafd.png",
        "kind": "perk"
      },
      {
        "name": "Super Visor",
        "description": "After using Helix Rocket, activate Tactical Visor for 0.5s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/cf57dc5464ab6284dbcac61b122ab29c1b862e4183b5908ab3c29cff75851fdb.png",
        "kind": "power"
      },
      {
        "name": "Peripheral Pulse",
        "description": "During Tactical Visor, Pulse Rifle auto-aims at 1 additional enemy, dealing 50% reduced damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/96dbd3d5ba86e0d0fef740c45e034a13a7520fa712837160dc08db23c712b657.png",
        "kind": "power"
      },
      {
        "name": "Run and Gun",
        "description": "Shooting Pulse Rifle and using abilties doesn't interrupt Sprint. ­ Dealing damage during Sprint grants 1% Sprint Move Speed and Lifesteal for 5s, up to 25%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/2f38d30b74c652f6d7c5bddd4b724863c0808d5efc0cd3d222cb2b2dd99fe847.png",
        "kind": "power"
      },
      {
        "name": "Chaingun",
        "description": "While continuously shooting Pulse Rifle, each shot grants 0.5% Weapon Power, stacking up to 100 times.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/aad7d3fa6751a3968385badb2c95c21ec1dfa68fe3d30bf217272a78cccd8fdc.png",
        "kind": "power"
      },
      {
        "name": "Double Helix",
        "description": "Helix Rocket fires a second homing Helix Rocket that deals 70% reduced damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/232f43200dd8430ea4f3d7e77dd2d8f4addd9b5aaec4c9c3cd6dcc244715e5e7.png",
        "kind": "power"
      },
      {
        "name": "Cratered",
        "description": "Increase Helix Rocket explosion radius by 40% and explosion damage by 15%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/83d1fae904a0a14e1fc5497433b850d59d982a2f0d3ffd698d25ce7985995a07.png",
        "kind": "power"
      },
      {
        "name": "Hunker Down",
        "description": "When Helix Rocket deals damage, create a Biotic Field with 50% reduced duration and 50% reduced effectiveness at your position.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/6e17a0530dd34aba4fb750c3936ab79aa2aff209b936916e619cbbdae767c5f5.png",
        "kind": "power"
      },
      {
        "name": "Aura Cloud",
        "description": "+40% Biotic Field Radius.­ Enemies within your Biotic Field take damage equal to 100% of its healing.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/ed01be848d20bd6e83bfb7360a1611ce42a65bbefc5dad9414838c7e1601099b.png",
        "kind": "power"
      },
      {
        "name": "On Me!",
        "description": "Biotic Field moves with you.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/dfcf0646f84cd2f86ea126e6687321b4677cd2e7f519433e5d43662541f97c01.png",
        "kind": "power"
      },
      {
        "name": "Track and Field",
        "description": "During Sprint, abilities refresh 75% faster and you restore 15% Max Ammo every 1s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/45d40ab02c3f2787046cefce2245542ddb940d1356ebbae14552cf5c5a5ed73c.png",
        "kind": "power"
      },
      {
        "name": "Frontliners",
        "description": "Allies in range of your Biotic Field when it spawns gain Overhealth equal to 25% of your max Life for 2s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/1c5f3cc08608d906eb8de8f45edc48dfa1b605ff225245ecddf115572150f88c.png",
        "kind": "power"
      },
      {
        "name": "Biotic Bullseye",
        "description": "While in Biotic Field, gain 50% more Ultimate Charge and critical hits restore 20% Max Ammo and extend the duration of Biotic Field by 0.5s, up to 5s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/832c58ddc60e800f311bcfc93c6d52577ad4261aa80dde5c200b98d0f3947746.png",
        "kind": "power"
      }
    ]
  },
  "sombra": {
    "items": [
      {
        "name": "Encrypted Upload",
        "description": "Hack can be used while invisible, successful hacks increase the duration of stealth by 3 seconds.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/282c6799d179564162500a2baff9dd78add8c67aab0142ae4164f7da39a95acb.png",
        "kind": "perk"
      },
      {
        "name": "CTRL ALT ESC",
        "description": "Teleporting with Translocator while below half health initiates passive health regeneration.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/b6d526c6b4a6dc8af1266bafb5dca4e649754e3ad4ffd8b7338601f40adb0b87.png",
        "kind": "perk"
      },
      {
        "name": "High-Speed Bandwidth",
        "description": "Hacked health packs provide allies with 25% increased movement speed and 50 overhealth for 4 seconds.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/74aaa7eed6e3eda7d9336006455230e43c769500027b95e68062ddf836a237ab.png",
        "kind": "perk"
      },
      {
        "name": "Viral Replication",
        "description": "Hitting a hacked enemy with Virus spreads Virus to enemies within 8 meters.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/f07dadc22d6b469a372f58031769729390acbcbd3541d0d4f9f69b98153b5b25.png",
        "kind": "perk"
      }
    ]
  },
  "symmetra": {
    "items": [
      {
        "name": "Sentry Capacity",
        "description": "Sentry Turret gains an additional charge.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/4e1fb364d87d9e78b9103b2bac3b553f743fd44a1bb5170aaae128fe4d79eac5.png",
        "kind": "perk"
      },
      {
        "name": "Perfect Alignment",
        "description": "Increase the range of Photon Projector's primary fire by 20%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/b36193e986b8e815b07ebf01a85bc2c29a1cd34c2ee50c458f7d07d933b4a0d8.png",
        "kind": "perk"
      },
      {
        "name": "Hovering Barrier",
        "description": "Teleporter gains the option to create a forward moving barrier instead. Pressing E again slows down the barrier's movement.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/674c0286e244b391dbda20695dfb4ed08c9ab7265741c91be4549f7fcbf4d3a7.png",
        "kind": "perk"
      },
      {
        "name": "Shield Battery",
        "description": "Symmetra regenerates 20 shields per second while within 10 meters of her teleporter.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/2bec4e3cd61b5516075b478abdb34676bd458579ab1764699a1ab106a1dbaefb.png",
        "kind": "perk"
      }
    ]
  },
  "torbjorn": {
    "items": [
      {
        "name": "Hammer Time",
        "description": "Move 20% faster while Forge Hammer is equipped.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/d60050f7eff6fa99e2914cceacd5fcc2e5bec6b1c898155246743d51be4bebc4.png",
        "kind": "perk"
      },
      {
        "name": "Pre-Heated",
        "description": "Molten Core activates Overload.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/510847cb9a3e297cea8bdab984e2589cc30f72dd611899b26409dbb5fe8a84fd.png",
        "kind": "perk"
      },
      {
        "name": "Anchor Bolts",
        "description": "Deploy Turret's throw range is increased by 50% and it can now attach to walls and ceilings.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/5f3ae1fcd2f9a78ae44293324d53c8cd9273b42cf9be0d56ff920ee5f45c589d.png",
        "kind": "perk"
      },
      {
        "name": "Overloaded Turret",
        "description": "Overload upgrades your Turret for 5 seconds, increasing its health and damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/c6eb6f52be58ddb12bf57b744d374f00871fd0068345e61b0c962eb04c0901b5.png",
        "kind": "perk"
      },
      {
        "name": "All Grown Up",
        "description": "While Overload is active, Turrets are upgraded 1 Level to a maximum of Level 3.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/48fd6465cb9821fc5c328c064f3eeb28d6e296a0cf0d3c21475baa75fe33ee3b.png",
        "kind": "power"
      },
      {
        "name": "Swedish Sauna",
        "description": "Molten Core heals allied heroes within it for 50% of Molten Core Damage every 1s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/a2ee52c75245e9da3bc901fa540c7ce07f6c48c50f4703b35ca5449ef1d8a073.png",
        "kind": "power"
      },
      {
        "name": "Magmini",
        "description": "When you use Overload, gain 2 Ammo of Molten Core with 66% reduced damage and duration.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/b8cdde3235ecfce78075b0afae6f39f7c3e3f9efc909d1f02df1584e874a36cf.png",
        "kind": "power"
      },
      {
        "name": "Come Get Yer Armor",
        "description": "When you use Overload, throw 2 Armor Packs that grant Armor equal to 15% of your Max Life. Armor Packs do not stack.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/5cd14abddb5900f89139905d2277b16911f28e3a126cd025148c65128c6d6a45.png",
        "kind": "power"
      },
      {
        "name": "Let Off Some Steam",
        "description": "While Overload is not active, Weapon Damage and Weapon Healing reduces Overload Cooldown by 8%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/200bbb44f834c54c6b0845e12c8f074079a60c2e36aed12d8463f8dfea3c401d.png",
        "kind": "power"
      },
      {
        "name": "Forged In Fire",
        "description": "While Overload is active, every Forge Hammer swing explodes, dealing bonus damage equal to 10% of your Max Life in a 3m radius.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/68b2024bd746c4bf861065081a74e8d02ec473658a0067d0e78b01047bfe28df.png",
        "kind": "power"
      },
      {
        "name": "Dwarlord",
        "description": "Overload grants all allies within 5m Overhealth equal to 50% of Overload Overhealth and 10% Attack Speed.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/0c2cad8537b69beabe6e916e33c55251db2e090ac17588dea36b1639545680dd.png",
        "kind": "power"
      },
      {
        "name": "Riveting",
        "description": "Every 5th Rivet Gun shot shoots both your Primary Fire and Secondary Fire. The bonus shot deals 10% reduced damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/df55ba0ab54896fdcd78d29eb62ca1b2061248cdd103b8c57438759d79e65857.png",
        "kind": "power"
      },
      {
        "name": "Blacksmith",
        "description": "Hitting an ally with Forge Hammer heals them for 100% of ­ Forge Hammer damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/7e982e6685f7840de3b7979855b276823f1c2fdf67c999a596bb9b9a650f4f85.png",
        "kind": "power"
      },
      {
        "name": "Hammer Throw",
        "description": "Ability: While Forge Hammer is equipped, use Secondary Fire to throw it. It has 200% effectiveness on Turrets and allies.­ (2s Cooldown).",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/08e7c67289ad9206d2bb0580276fa1dd683d47919f879a29456aa73605a62e9b.png",
        "kind": "power"
      },
      {
        "name": "Turriplets",
        "description": "You can have 3 Turrets active. They start at Level 1, have 50% Health and 65% Attack Speed, and can be upgraded temporarily with Forge Hammer hits for up to 24s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/d8214258de7adab46541ee571ac479c6c5e763fb8795e69f58fa0f2399de5d92.png",
        "kind": "power"
      },
      {
        "name": "Clocked",
        "description": "Turret damage marks enemies for 8s. Gain 25% Weapon Lifesteal and 15% increased Weapon Damage against marked enemies.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/005a11121221a741c6c27983b9a5c3f56898d61861fa9afbffbcfb2dda4ded3d.png",
        "kind": "power"
      }
    ]
  },
  "tracer": {
    "items": [
      {
        "name": "Chronal Dash",
        "description": "Blink distance is increased by 20%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/644e5b1f52930510c1172c5b68f9cb2769195f71a84310ff1b2824dbfa2dab18.png",
        "kind": "perk"
      },
      {
        "name": "Kinetic Reload",
        "description": "Melee hits reload 12 ammo.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/0f73a044de1866a093ccb2e7e368a730387936eae6cb18274b4dbafed26fa0fe.png",
        "kind": "perk"
      },
      {
        "name": "Blink Packs",
        "description": "Health Packs restore 1 Blink charge.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/de00cd532bf045c7d4e242d01944723f724f2eaa6f8df8a44769450d8f49b0d3.png",
        "kind": "perk"
      },
      {
        "name": "Quantum Entanglement",
        "description": "Recall grants 50 overhealth and 20 ammo that decays over time.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/ace0ed5106148847a2b2f4dfcee58b883ed38bb2851ccbd106528f4ddea6cf41.png",
        "kind": "perk"
      },
      {
        "name": "Flash Fist",
        "description": "For 1s after using Blink, your next Quick Melee is affected by Ability Power, deals 25 extra damage, and knocks enemies back.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/b4cbf7f301b1d10ddd16166bb8f03bbcfdc1e16e2b9b965ed795a6108e320b24.png",
        "kind": "power"
      },
      {
        "name": "Quantum Clip",
        "description": "If you use Blink while reloading,­ gain 25% Max Ammo and 10% Weapon Lifesteal until you reload.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/a382d8075314f1c918f7cd9753ef3e869e12976fd1aea1c83ddc8a644ebe2c3c.png",
        "kind": "power"
      },
      {
        "name": "Auto Recall",
        "description": "Once per round, if you would die, instead use Recall for free.­ Spending your Ultimate Charge reduces Recall's cooldown by 50%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/0c18dc34dade56919eba9ca1b2184acd59755284f37457918e20e1c497c3263f.png",
        "kind": "power"
      },
      {
        "name": "Timelapse",
        "description": "Hitting 2 consecutive shots on the same target without missing deals 2 extra damage over 2s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/52c2998f4a590f5771c605e2f9c5450bfb677563ba2682a13d02a14cda3737b0.png",
        "kind": "power"
      },
      {
        "name": "Get Stuffed!",
        "description": "Quick Melee hits grant 5% Ultimate Charge and reduces Recall cooldown by 2s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/f49b3d1630d7a7fc31542bb64cc0fc09a32d3517d4cd7b4ec477e6e156a6ecee.png",
        "kind": "power"
      },
      {
        "name": "Quantum Reload",
        "description": "After Recalling, gain Ammo equal to 100% Max Ammo that decays over time.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/5c059ae00f4f5750f5d4bf2707abcba65c1630b71cdb8a524a1de2a74c66fd94.png",
        "kind": "power"
      },
      {
        "name": "Blink Hop",
        "description": "Blink teleports you 3m farther.­ If you use Blink while airborne, gain an air jump and reduce Blink cooldown by 0.2s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/58385facd9e2bf4b1b0f02553149b5937aa2f6db67e395096465fb8f929b3b40.png",
        "kind": "power"
      },
      {
        "name": "Temportal",
        "description": "Recalling leaves behind a Temporal Portal for 8s. Up to 3 allies can Interact with it once to Recall back in time 1s. ",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/03350d0e5d17496c5f9c2a884bbbac37a199ac6b132f50346d85a688446a360f.png",
        "kind": "power"
      },
      {
        "name": "Impulsive",
        "description": "When you use Recall, throw a Pulse Bomb that detonates 50% faster but deals 60% less damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/89607f1b0bdc6a40be8912e98533931dd3967c0411da3f7b93ee69c326c85864.png",
        "kind": "power"
      },
      {
        "name": "Alternate Ending",
        "description": "When you use Recall, heal allies within 6m for 100% of the damage they have taken in the last 3s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/2816340910a16ae6eecfac313b8aa2d8391d41aaaf8b119f3665b88bf8597689.png",
        "kind": "power"
      },
      {
        "name": "Bullet Time",
        "description": "When you use Recall, drop a Temporal Field that slows projectiles by 95% and enemies for 20%.­ You take 25% less damage from Hitscan for 4s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/a6fa4c5f392ffcf3563699629ee74c6615ae967f04861aad463541000e70c020.png",
        "kind": "power"
      },
      {
        "name": "Chrono Stabilizer",
        "description": "After you use Blink, heal allies within 6m for 40 and yourself for 10.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/6f2bff1f865ead92d01e88d504a28822bf463299ccba55f42b5f8997fb864c02.png",
        "kind": "power"
      }
    ]
  },
  "vendetta": {
    "items": [
      {
        "name": "Extra Edge",
        "description": "Projected Edge costs 25% less energy.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/e970c9fa76693e93f3f490fdfd46efd56ba6a603d9b9169daa32b4b9a9cae1e8.png",
        "kind": "perk"
      },
      {
        "name": "Raging Storm",
        "description": "Whirlwind Dash continues to spin, hitting 3 more times for 30 damage in a wide area.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/954fc7de0d9e63b963e255eb433ceba0a8fe7af235e93023bbc2788decec218e.png",
        "kind": "perk"
      },
      {
        "name": "Siphoning Strike",
        "description": "Overhead strikes gain 40% Lifesteal.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/2f56f724364510363723ecace47dd3d08358146b1d689dca22fe1040c7f61705.png",
        "kind": "perk"
      },
      {
        "name": "Relentless",
        "description": "Onslaught can stack 3 more times, increasing attack speed by 5% and movement speed by 3% per stack.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/6f16af6f1ddffb07db1c5885caf9ed63754c025d0ad7d0be09d7b45908fad80e.png",
        "kind": "perk"
      },
      {
        "name": "Rampant Onslaught",
        "description": "Onslaught's maximum stacks are increased by 1 after every 2 eliminations, up to 3.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/52b1c57163f42e3ba88402bd62ccfe0576c9954e098e9f957cc80da45e23b9f0.png",
        "kind": "power"
      },
      {
        "name": "Undying Fury",
        "description": "If you would die, instead become Hindered and prevent ally healing, gain decaying Overhealth equal to your Max Life, and double your Onslaught stacks and Lifesteal. ­ (90s Cooldown).",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/9a5441c962f7f84096c1770eb9c4669aad4f1a603d15923cf5034fd8d080f244.png",
        "kind": "power"
      },
      {
        "name": "Skycut",
        "description": "After using Soaring Slice, your next Overhead Strike shoots a Projected Edge with 75% damage when landing.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/b2e444390e69fe52fa0010d6384282bc5681b429a850d1b3b0c13d433b4bf319.png",
        "kind": "power"
      },
      {
        "name": "Overloaded Strike",
        "description": "After using Soaring Slice, your next Airborne Overhead Strike can channel a level 1 Sundering Blade with 25% increased damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/f9873c6818126218e1773af93fdae301831f33d3e02d3bd32d28d6567f752724.png",
        "kind": "power"
      },
      {
        "name": "Defiance Core",
        "description": "Warding Stance energy regenerates now even while blocking at 75% rate.­ For every Projected Edge fired, reduce Whirlwind Dash and Soaring Slice cooldown by 0.5s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/4dc958dc922601b7444128c58f3542d3e900eb5f4daadee18f704c1651c3f4d8.png",
        "kind": "power"
      },
      {
        "name": "Riposte",
        "description": "After blocking damage, remove Warding Stance's Move Speed penalty. Your next swing becomes an Overhead Strike.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/ee09cd0bf3ec7a40d76613594c4010cfae4b00a69536bdffbbe2112c6396f28a.png",
        "kind": "power"
      },
      {
        "name": "Cyclone Charge",
        "description": "Whirlwind Dash can spin 3 additional times, dealing 75% damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/6ee4707a671f8691d05a4b50d4422b3d8a07738e94ac83aa7ac6b40c0ac874df.png",
        "kind": "power"
      },
      {
        "name": "Double Dash",
        "description": "After Whirlwind Dash is finished, it can be reactivated within 3s for 75% damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/16f02947f3108ecc4eafc27d62da2b10c24a602e84db9d18276a8441db5ab7c6.png",
        "kind": "power"
      },
      {
        "name": "Exalted Empress",
        "description": "After using Soaring Slice, Overhead Strike and Sundering Blade give 30% of damage as Overhealth, up to 200.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/aa53383c530e1fd769ba578602f854e3306a22e8f1a771803ce28fbcadeec10b.png",
        "kind": "power"
      },
      {
        "name": "Cataclisma",
        "description": "Projected Edge and Soaring Slice explode on enemy hit, dealing 30 damage to enemies within 4m.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/a757a15e5e39a404a998e8b46cf0dfe97546a33662b820f80fac2abd2f8a9828.png",
        "kind": "power"
      },
      {
        "name": "Furious Friction",
        "description": "Warding Stance has 25% increased energy regeneration rate. ­ When you deal damage with Projected Edge gain an additional 50% for 3s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/f438c371ac8bef1ecfc6dd8f4d914a8e6435615c7dee8922d062e3c4f34f01d2.png",
        "kind": "power"
      },
      {
        "name": "Apex Bloodlust",
        "description": "Gain 5% Lifesteal and your abilities refresh 3% faster for each Onslaught stack you have.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/a08c4bd33dc4c407be3d4b561bf4dbc7ff75a014e7b0e1c71b93fa307edfee50.png",
        "kind": "power"
      }
    ]
  },
  "venture": {
    "items": [
      {
        "name": "Deep Burrow",
        "description": "Drill Dash distance is 50% longer while burrowed.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/74c79013c0286944d1b98298ed164d3d7d8f8c4248c3369af265fecadb7154b1.png",
        "kind": "perk"
      },
      {
        "name": "Excavation Exhilaration",
        "description": "While Tectonic Shock is active, cooldowns refresh 300% faster.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/d960ab39306289f689d7796d9ed40bc638e5ff8179c48be8cc6f7fa8a5b22497.png",
        "kind": "perk"
      },
      {
        "name": "SMART Extender",
        "description": "Empower SMART Excavator with E to increase its maximum projectile range by 100% for 4 seconds.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/8d8769f9aedd55622b1c994ae8cf7cddefbc66a55e0b33bbb4f07b2de7220e15.png",
        "kind": "perk"
      },
      {
        "name": "Covered In Dirt",
        "description": "Dealing damage with Clobber grants up to 30 Explorer's Resolve shields.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/bd3a6e0335e5c643bac274f1c7e6920712eb2844d2ef60e19434f1841990a238.png",
        "kind": "perk"
      }
    ]
  },
  "widowmaker": {
    "items": [
      {
        "name": "Scoped Efficiency",
        "description": "Scoped shots cost 3 ammo instead of 5.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/7b4791cbfcc18876850b21a4c555d150081fa4689e9b489d6291bee40e0d8e9e.png",
        "kind": "perk"
      },
      {
        "name": "Sniper's Instinct",
        "description": "Scoped shots charge 100% faster for 2 seconds after using Grappling Hook.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/c7788454504da63392a16b1cee6c2edc3675eb4520c0c6e08fb2543c289648b2.png",
        "kind": "perk"
      },
      {
        "name": "Seeker Mine",
        "description": "Venom Mine now fires poison darts at enemies within 10 meters and remains active after triggered.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/24e57c5145c859408f311fd13ca239da270c9258f0749e6e302a3ecdbdfb9044.png",
        "kind": "perk"
      },
      {
        "name": "Widow's Bite",
        "description": "Scoped shots can charge up to 125%, piercing enemies when fully charged.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/0643cb690b369b1c2bcaab485ea20113ad629755c37bf2e14b7beb9b470cddba.png",
        "kind": "perk"
      }
    ]
  },
  "ana": {
    "items": [
      {
        "name": "Groggy",
        "description": "Enemies waking from Sleep Dart are slowed and take 50 damage over 2 seconds.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/261f0fabdaf55159b9e13103abd465cfe3bf50a3906f97b1a47e9c2dc961905b.png",
        "kind": "perk"
      },
      {
        "name": "Speed Serum",
        "description": "Nano Boost grants a 30% movement speed boost to both Ana and her target.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/2dc4cdf319916abf18c9972b4fb8d14e5dd92e319960b36846c270b3bd5ffa4f.png",
        "kind": "perk"
      },
      {
        "name": "Biotic Bounce",
        "description": "After exploding, Biotic Grenade bounces and explodes again for 60 damage and healing.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/388dfc3c6fb4cb6a233350b887d1400876890a33c79e49d7fb3c6ca220eddc31.png",
        "kind": "perk"
      },
      {
        "name": "Headhunter",
        "description": "Biotic Rifle can crit enemies.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/fe56a0ef536dd3f17d3c7728151ff60ef1a48071e93c2071c095f4e1712e6721.png",
        "kind": "perk"
      },
      {
        "name": "No Scope Needed",
        "description": "Landing unscoped shots with Biotic Rifle grants 10% Attack Speed for 2s, stacking up to 3 times.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/4d7afbb8d375f27012ecaefe999020d23f080f87f3a0768444a0144b553eefb9.png",
        "kind": "power"
      },
      {
        "name": "Pinpoint Prescription",
        "description": "Biotic Rifle can now critically hit both allies and enemies.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/1e2cdff8735de411d92c3616bb99fb81772fa30b6bbe7ed47cb74a421dc5d9d8.png",
        "kind": "power"
      },
      {
        "name": "Dream Field",
        "description": "Sleep Dart hits heals allies within 5m for 15% of your max Life every 1s for 5s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/f8879c1d88b1e611117391a9fe9aa31233b7aa669d44a0e17a602071500dc7af.png",
        "kind": "power"
      },
      {
        "name": "Comfy Cloud",
        "description": "Sleep Dart explodes on contact, hitting targets within 3m, but Sleep has a 50% reduced duration.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/248eacbd4db44bc4328314b42b2c83cab67f505f971677e0314bf439e65f145d.png",
        "kind": "power"
      },
      {
        "name": "Home Remedy",
        "description": "+30% Biotic Grenade Radius.­ Biotic Grenade grants Overhealth equal to 30% of your Max Life for Biotic Grenade's duration.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/b8b3d0598e5930a66536c53308c0f57f15848da0983b696034a143d32ef234d1.png",
        "kind": "power"
      },
      {
        "name": "Venomous",
        "description": "Biotic Grenade deals an additional 75 damage over 2s to enemies affected.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/0012cc0dbcaaae63a9911aaff75067927524068be80ed286f5411d2612332e82.png",
        "kind": "power"
      },
      {
        "name": "My Turn",
        "description": "Casting Nano Boost also applies to Ana for 100% of its duration.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/99c91c8b0374c01a74fde3f3bb124fb2d605fa6fc07b2e6f7841553478dd4b9e.png",
        "kind": "power"
      },
      {
        "name": "Our Turn",
        "description": "Casting Nano Boost also affects other allies in your line of sight, but it has a 25% reduced duration on them.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/c32cfa59c64c9ff31471db73ec2baf6947e3e0ca8f9fc940772727071c1a034a.png",
        "kind": "power"
      },
      {
        "name": "Artsy Dartsy",
        "description": "+75 Sleep Dart Base Damage.­ While scoped with Biotic Rifle, you can shoot Sleep Dart through the Biotic Rifle with 300% increased projectile speed.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/02ce664a23ee90106cb783374fec9b736af88a02a3e396d33c59db49baa04b21.png",
        "kind": "power"
      },
      {
        "name": "Fountain of Soothe",
        "description": "Sleep Dart spawns a Biotic Grenade with 50% effectiveness.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/3c998ef3c9e924acec399df84b1f1844e6d57fa240f183a8b51c15a19c9acbe5.png",
        "kind": "power"
      },
      {
        "name": "NanoNade",
        "description": "Biotic Grenade applies Nano Boost with 25% effectiveness to all allies hit for 1.5s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/6b173f11ecdec8a484c054a95a0102bce922e8c6b92112b71c0dc8559146c451.png",
        "kind": "power"
      },
      {
        "name": "Falconer",
        "description": "Nano Boost also gives 30% increased Attack Speed and 25% Ultimate Charge.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/254c40da2158ee7ddc963d3b6916f1fcbd4694853c6557479786d9eb073c9ff4.png",
        "kind": "power"
      }
    ]
  },
  "baptiste": {
    "items": [
      {
        "name": "Expanded Field",
        "description": "Immortality Field's radius is 30% bigger.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/99a5dc8c29d169d2c8e095495657d8d69a57e19e311f8282c8d5f6648cd74f9e.png",
        "kind": "perk"
      },
      {
        "name": "Assault Burst",
        "description": "Regenerative Burst now provides Baptiste with 20% increased attack speed for 3 seconds.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/78de19e8f754a2882980435a03ada17d1bd791bbec10bfa9a076cdf82ef9ccce.png",
        "kind": "perk"
      },
      {
        "name": "Automated Healing",
        "description": "Using any ability triggers Baptiste's Shoulder Turret, periodically firing up to 3 shots at allies, each restoring 40 health.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/0ba2344d9af993c4ba4f74f7a381327f20bcf153e78d2b0269a2fa1ef5884a6a.png",
        "kind": "perk"
      },
      {
        "name": "Rocket Boots",
        "description": "While airborne from Exo Boots, use SPACE to dash horizontally.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/d2a943d5fce3bba49e1f482c0cd56973cb287fb40d2fd089f40a15047856a378.png",
        "kind": "perk"
      }
    ]
  },
  "brigitte": {
    "items": [
      {
        "name": "Combat Medic",
        "description": "Melee attacks against enemies reduce the cooldown of Repair Pack by 0.75 seconds.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/653e76687c41ac4c2f6aa02bcb0277228c13a7d0ac62b8b4dc6259191bad98ff.png",
        "kind": "perk"
      },
      {
        "name": "Morale Boost",
        "description": "Inspire lasts 3 seconds longer when activated by Whip Shot.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/ce74272f296ac761d22db50718ce39fe4622c0304cc2570ab9a7e2bb82ca135f.png",
        "kind": "perk"
      },
      {
        "name": "Inspiring Strike",
        "description": "Shield Bash grants 30% increased movement speed for 2 seconds. Inspire's healing is instant when activated by Shield Bash.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/a1a518ab82a42370401a2b3e4284e7efca3f2eb4bc2dd55d11755ea192afcae8.png",
        "kind": "perk"
      },
      {
        "name": "Whiplash",
        "description": "Whip Shot's knockback can slam enemies into walls, dealing 60 extra damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/9d6a8ce740dd9b84adc1b60a518501c66d83f4c592ae84dec4cd3c9e4f159a40.png",
        "kind": "perk"
      },
      {
        "name": "Whirlwhip",
        "description": "After using Shield Bash or Whip Shot, your next Rocket Flail swing deals 25% bonus damage and hits all enemies around you within 5m.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/1d03d93fd47981adeb09219295f58a15cb9e71564dda891e4a314964bbde4b76.png",
        "kind": "power"
      },
      {
        "name": "Righteous Cleave",
        "description": "After using Shield Bash or Whip Shot, your next damaging Rocket Flail swing heals allies within 10m for 125% of damage dealt.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/b2bf650868f724e50029dcc12b9de662f72f068ce23d8e9529f7ef80830ac9bc.png",
        "kind": "power"
      },
      {
        "name": "Burst Aid",
        "description": "Ability: Use Reload to consume 1 Repair Pack charge and heal 20% of Max Life and gain a burst of 50% Move Speed.­ (3s Cooldown).",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/60f6a954c3d7250b7e025834e0ce60602593c9b3e35013266a9ff36081fb1876.png",
        "kind": "power"
      },
      {
        "name": "Optimizer",
        "description": "For each Repair Pack active, increase Repair Pack Healing by 10% and heal yourself for 4% of your Max Life every 1s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/c3c843ad1c9f4086f38d2378fe40df15bcc28e1d3fb42ebe802c2179dd783e47.png",
        "kind": "power"
      },
      {
        "name": "Packstacker",
        "description": "Repair Pack duration is increased by 25%. Ability damage extends the duration of all active Repair Packs by 1s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/0aaa89841e402730eb0e2e94ff9262deb720b5fbe4461554824d220d96ebf000.png",
        "kind": "power"
      },
      {
        "name": "Maces to Faces",
        "description": "Whip Shot's size is increased by 1m and can hit multiple enemies. Inspire lasts 1s longer when triggered by Whip Shot.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/e2e1e1e81b7b6ca89206608ee59375215539caf618dbd56103b4f1bcaf6c18cf.png",
        "kind": "power"
      },
      {
        "name": "God Ray",
        "description": "Ability damage to targets over 10m away Burns them for 5% bonus damage for every 1m the ability travelled.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/7a4b2c7ea97705ad58b9cdff2c4b4cdf41f528c32e66616471ecdf2f900d6043.png",
        "kind": "power"
      },
      {
        "name": "Sköldkastning",
        "description": "After using Shield Bash, your next Rocket Flail swing projects a Shield Boomerang that deals 40% Shield Bash damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/bbd6a7b6bc8a6303823788cd50a021739d0c8944a866af9bf02ac84aca0031c0.png",
        "kind": "power"
      },
      {
        "name": "Lindholm Wall",
        "description": "Increase Barrier Shield size by 60% and Barrier Shield Health by 100%. Shield Bash can hit multiple enemies.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/9f04e409e19ad71da59a1b481b6960f09dd745d7a9a47ab1bb485aa48d7a8dc8.png",
        "kind": "power"
      },
      {
        "name": "Mender Bender",
        "description": "After using Shield Bash, heal 33% Barrier Shield Health and trigger Inspire.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/46457ae7157c6bfb7670bac3360b9c4bdaa537881f7aad5b9db1742374223da9.png",
        "kind": "power"
      },
      {
        "name": "Aura Farming",
        "description": "When Inspire is triggered by an ability, all heroes affected by it gain Overhealth equal to 4% of your Max Life for 5s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/9c4768e1ab8e90398b1e8cdbf3217c9a6301f5a07067b9e1ea3aea5c37295ab9.png",
        "kind": "power"
      },
      {
        "name": "Consecrated Ground",
        "description": "+25% Starting Ultimate Charge.­ While Rally is active, trigger Inspire every 1.5s and ability cooldowns refresh 25% faster.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/2517fd024abc27e316cccb79f0ec123d032746984165d74b5d87c038ddf6fdb1.png",
        "kind": "power"
      }
    ]
  },
  "illari": {
    "items": [
      {
        "name": "Rapid Construction",
        "description": "Healing Pylon builds 300% faster and its cooldown is reduced by 2 seconds.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/4b8c74a61160d2de10a3105ce10635be1d623c52f3dfacd633ae20c1d6a1045b.png",
        "kind": "perk"
      },
      {
        "name": "Summer Solstice",
        "description": "Captive Sun grants Illari 20% increased flight and attack speed, and extends her flight duration by 3 seconds.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/b31ad6c4eea05cd96084c7b87509b0c3678ac8f04678f388863f16a271e496c4.png",
        "kind": "perk"
      },
      {
        "name": "Solar Flare",
        "description": "Press  while using Solar Rifle's healing beam to heal all allies in front of Illari for 100 healing.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/3b39d69790004174fc0367ed9c7fbce8e430ffe8e885c8e32ae1d678fd8c42e5.png",
        "kind": "perk"
      },
      {
        "name": "Sunburn",
        "description": "Outburst ignites enemies, dealing an additional 50 damage over 3 seconds.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/2405e6d589b8d6c7bd5e072f7788480bbcfeda6a1ce48ad67e2d8915289e8798.png",
        "kind": "perk"
      }
    ]
  },
  "jetpack-cat": {
    "items": [
      {
        "name": "Ulterior Motive",
        "description": "15% of Biotic Pawjectiles healing recovers fuel.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/1d18749d884a8c09dfa5789c5f31eb99f6c78e4b93b3268960f60730abcaf924.png",
        "kind": "perk"
      },
      {
        "name": "Transport Shielding",
        "description": "Gain up to 50 extra shield health while carrying another hero.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/acd4b58fc4607cf4471de067547d9dd1fd1760fbf55d67217f0574567aa0e98b.png",
        "kind": "perk"
      },
      {
        "name": "Headbutt",
        "description": "Frenetic Flight can knockback an enemy when flying fast enough, dealing 50 damage on impact.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/8acbab332f33f9c286388451d5ba322cc0aea8baddaee562900dad4da1b9d777.png",
        "kind": "perk"
      },
      {
        "name": "Claws Out",
        "description": "Quick melee becomes empowered every 6 seconds, wounding enemies for 40 damage and slowing them by 30% for 1 second.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/989caae5faf782438c32b4ed7451ac93ebff03d884c065c768c1cee265b8aae9.png",
        "kind": "perk"
      },
      {
        "name": "Territorial",
        "description": "Enemies within your Purr take damage equal to 30% of its healing.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/cfc8716247716d40cf17a0792b53075deafc273898c32db2d00decab5644f1a5.png",
        "kind": "power"
      },
      {
        "name": "Purr-sistence",
        "description": "Purr persists 15% longer for each ally or enemy currently affected by Purr, up to 75%. Amount of healing pulses resets every 4 pulses.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/1e672aa6686899d0e2f66b083629b3bc4f1cd809dcc1f1282751101e8bf76bc3.png",
        "kind": "power"
      },
      {
        "name": "Battle Fur-mation",
        "description": "Lifeline can tether to 1 additional ally.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/291c8d06d9fec1688505ce8832f06bc4f34fd701ee4f3f6586f17037c52c08e1.png",
        "kind": "power"
      },
      {
        "name": "Tow-Beans",
        "description": "When you release a target from Lifeline or Catnapper, gain 20% fuel. ­ Restore 1% fuel for every 7.5 Ability Damage dealt.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/3069e22d7db6aa0d3e787f9efadf0a0fb4472dce6daf2d79c674f59887d1ee09.png",
        "kind": "power"
      },
      {
        "name": "Frenzy",
        "description": "Ability: Your next Quick Melee slows and deals 40 damage over 3s and increases Quick Melee Attack Speed by 100% for 1s. ­ (8s Cooldown).",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/5fb6ef84d4a15b974bc0253377a588be696a331e6799d791e9c49fb0bf85a4ec.png",
        "kind": "power"
      },
      {
        "name": "Zoomies",
        "description": "After activating Frenetic Flight for 0.5s, next time you collide with an enemy, explode for up to 120 damage and restore up to 40% fuel based on distance travelled. ­ (1.5s Cooldown).",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/35948be2d3d5b051f0c7d0a838acff010a45b420e4a96a8c2649752926d9d984.png",
        "kind": "power"
      },
      {
        "name": "Lindholm Inspiration",
        "description": "When Purr ends, all other allies within Purr's radius gain Overhealth equal to 30% of damage dealt during Purr and 10% to yourself for 3s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/a43e5bcf250a960b250d82a31d675ac39a85bdf713606b45b6f8b92980e73bac.png",
        "kind": "power"
      },
      {
        "name": "Tomcat Reserves",
        "description": "While Frenetic Flight is active, Purr refreshes 40% faster and all other abilities refresh 80% faster.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/7d9dfcac7b5bcfeaa27191ff06318536efe4439e217727585c46f7941be12242.png",
        "kind": "power"
      },
      {
        "name": "Ambidex-fur-ous",
        "description": "While Purr is active, shoot both guns. The bonus shot has 35% effectiveness.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/280716b4b2bd0b39303222cafa138d4238cf1e406d74b5259981ac37540fcf34.png",
        "kind": "power"
      },
      {
        "name": "Bell Bomb",
        "description": "Ability: Lifeline tethers an explosive Toy Ball, that explodes for up to 120 damage on impact. ­ (6s Cooldown).",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/562ac9c9dec1f2106e301e16110970eb248dc6f06fa4e129ab2ea5be8598e804.png",
        "kind": "power"
      },
      {
        "name": "Scratch-ageddon",
        "description": "+25% Starting Ultimate Charge.­ Catnapper scratches all nearby enemies on impact, slowing them and dealing 150 damage over 3s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/bfdc276ae9c530e9860c21ccd9756915c5786193b0718842e6789112518903e8.png",
        "kind": "power"
      },
      {
        "name": "Bouncing Biscuits",
        "description": "When hitting an ally with Biotic Pawjectiles, it bounces to 1 nearby ally within 15m at 50% effectiveness.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/8dd4cbb43f641fe9254911360f66881776177643e211d8b960400da7581d9ea1.png",
        "kind": "power"
      }
    ]
  },
  "juno": {
    "items": [
      {
        "name": "Familiar Vitals",
        "description": "Pulsar Torpedoes lock onto allies 35% faster.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/c797b7a1b9be4f7df0cf86824570d408ed7a0e4112ad51545b3eaf78c4dbf44a.png",
        "kind": "perk"
      },
      {
        "name": "Locked On",
        "description": "Reduce the cooldown of Pulsar Torpedoes by 1 second for each enemy hit.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/477a3abe9f68e2a2324e3f2a8faeb14bb6102b2e0c272d93463d6d27726629ae.png",
        "kind": "perk"
      },
      {
        "name": "Lift Off",
        "description": "Martian Overboots can now triple jump.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/efe7a92601ea7fc95274ee11d1628fb31238c707331b87545a7c754fcd48ca68.png",
        "kind": "perk"
      },
      {
        "name": "Faster Blaster",
        "description": "While Glide Boost is active, Mediblaster fires continuously.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/7b122bd8091f5005bfee07aa787f98126ddbe80aacdd11e7a2d076b9d03e35b2.png",
        "kind": "perk"
      },
      {
        "name": "MediMaster",
        "description": "Mediblaster deals 50% increased Critical Damage and can crit allies. ­ Critical hits reduce Hyper Ring's cooldown by 0.2s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/c4fdfb0cf9fe56acd5d174b2ccaefd9986ff03ac7d3927fb2f7ffe651f9534fc.png",
        "kind": "power"
      },
      {
        "name": "Stinger",
        "description": "Mediblaster deals an additional­ 10 damage to enemies over 1s. (Does not stack).",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/0dd26b36792f6a141d9f5bc29b33d2c34c5f205148edcf760a0516d5df376a22.png",
        "kind": "power"
      },
      {
        "name": "Medicinal Missiles",
        "description": "Pulsar Torpedoes hits on allies cause them to receive 50% more healing for 3s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/275b972bca3f46a236daa0e7978941adcf79ec6b192c4872515a3606f76a1b25.png",
        "kind": "power"
      },
      {
        "name": "Pulsar Plus",
        "description": "Pulsar Torpedoes gains 1 additional charge.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/16911d2a2ef19ba1f547fb5cd39f8874450d1432168eb857e6d8eb9bffe04d3f.png",
        "kind": "power"
      },
      {
        "name": "Torpedo Glide",
        "description": "During Glide Boost, every 75 Weapon Damage or every 100 Weapon Healing you deal reduces the cooldown of Pulsar Torpedoes by 1s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/3f954b7d9445533008a0de7b72d0a73a19a0305cac43e1a1f7156cd23f82c749.png",
        "kind": "power"
      },
      {
        "name": "Blink Boosts",
        "description": "Glide Boost becomes 3 short charges with 75% reduced duration and 30% reduced cooldown.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/80939cf9b65c017eab1100222608a406d2c598cbd1dd29beb88f5eb6c3c4fcf6.png",
        "kind": "power"
      },
      {
        "name": "Hyper Healer",
        "description": "Allies affected by Hyper Ring gain 85 Overhealth.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/9ceb04d2a3a37d2008d00acf8682e33acb717b83b3218418d64b6ff3974a9c79.png",
        "kind": "power"
      },
      {
        "name": "Stellar Focus",
        "description": "While Glide Boosting or hovering, gain 75% more Ultimate Charge from Damage or Healing. ­ Orbital Ray now follows you and has 50% increased duration.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/56ef52c1b2ed550bc08cc1447982a219982c9666bd1c626494cdfc73217bbf8c.png",
        "kind": "power"
      },
      {
        "name": "PulStar Destroyers",
        "description": "Pulsar Torpedoes explode on hit, dealing 20 healing or damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/454ed70cff6d65b4c3cc0ccd315e530d87efc55ea3e0e302fdb79443cecdd4f1.png",
        "kind": "power"
      },
      {
        "name": "Fission Chamber",
        "description": "While affected by Hyper Ring, Mediblaster fires continuously.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/1edc5467a4c629388a894c0cc7a0f4212f966e29bf3dd121f455611aea6c9053.png",
        "kind": "power"
      },
      {
        "name": "Heal Formation",
        "description": "Allies affected by Hyper Ring are healed for 40% of the damage you do.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/c2dae14a333216fdfb66e43a5b17128ac3dbf41ce13192d3c1636eb44323c76c.png",
        "kind": "power"
      },
      {
        "name": "Marswalking",
        "description": "Hyper Ring deploys sideways and grants you 250% Jump Height.­ Reduce Hyper Ring's cooldown by 1s when an ally passes through it.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/4ea26385ee4228bbcffd105e6aef95ba9d32b5df066ee0985efd9eb9ea7af5c0.png",
        "kind": "power"
      }
    ]
  },
  "kiriko": {
    "items": [
      {
        "name": "Urgent Care",
        "description": "Healing Ofuda projectile speed is increased by 50% when seeking allies below half health.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/d057fa16941cc466d1d934ad3270ba3e6dc6fdd30b8ae78af0d8c684a4afbd21.png",
        "kind": "perk"
      },
      {
        "name": "Fortune Teller",
        "description": "Kunai hits launch 2 Healing Ofuda to an ally in front of you.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/50a9304063fc8ea8c23b6533940563cf666fb0a1f80e6240b30344aa014d40b6.png",
        "kind": "perk"
      },
      {
        "name": "Ready Step",
        "description": "Swift Step grants Kiriko 40% increased attack and reload speed for 3 seconds.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/e5443afa1c9fe57e7839befb9a986eb960fb08d66a0085f1bba898335a7eb740.png",
        "kind": "perk"
      },
      {
        "name": "Foxtrot",
        "description": "Protection Suzu grants allies 30% increased movement speed for 4 seconds.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/cd3b70802f80c187212db9a9db342e6aa4f0cd349d1979055e52eb7539a8cc30.png",
        "kind": "perk"
      },
      {
        "name": "Foxy Fireworks",
        "description": "After using an ability or gadget, your next 3 Kunai explode on contact, dealing 20 damage to nearby enemies.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/654716188d0a883d61dd7e559952b6e9e983701543dd1c2c004bedaae7c0d75d.png",
        "kind": "power"
      },
      {
        "name": "Keen Kunai",
        "description": "Kunai critical hits decrease ability cooldowns by 20% and refund 3 ammo.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/478ab5cea2f9da7b9ba5bbb84f5df633135a368a964e7f68be3e3f5c4ce03075.png",
        "kind": "power"
      },
      {
        "name": "Good Fortune",
        "description": "Kunai hits launch 3 Healing Ofuda to an ally in front of you.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/0b95a073d0030378539fe7c61bee7fd7d58c3880bbec63aef177a3d45ae1eec2.png",
        "kind": "power"
      },
      {
        "name": "Leaf On The Wind",
        "description": "Healing Ofuda bounces to another ally up to 2 times at 30% effectiveness.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/9f571e8dee0cede72e50c5c270d3d6a764e416541875f38bf28b46d8771c231c.png",
        "kind": "power"
      },
      {
        "name": "Self-Care",
        "description": "When you use Healing Ofuda, each Healing Ofuda thrown heals you for 2% of your max Life.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/be4442f93313ecf41948fdb30ae888e2afe42fd4adbbbae72297d1be01f163c6.png",
        "kind": "power"
      },
      {
        "name": "Supported Shooting",
        "description": "+100% Healing Ofuda Seek Radius­ When Healing Ofuda heals allies, grant them 20% increased Attack Speed for 3s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/7a1359873aced918baad3560028031df298e83d1c476a82bc4cb0ba3a743813d.png",
        "kind": "power"
      },
      {
        "name": "Fleet Foot",
        "description": "Swift Step can be used directionally without a target. Range is reduced by 50% when used without a target.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/f0df6939612e1e5d06428fa48f688aaf964e4fc77ceb4f768cf88e8730fe66a1.png",
        "kind": "power"
      },
      {
        "name": "Clone Conjuration",
        "description": "After using Swift Step, create a clone of yourself that lasts for 4s. Clone has 65% less damage and healing.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/3539deef787ed898e428bd85e04fd2ed730ee5486b57659ec1922ae7c704567d.png",
        "kind": "power"
      },
      {
        "name": "Cleansing Charge",
        "description": "When you cleanse negative effects with Protection Suzu, gain 5% Ultimate Charge for each hero cleansed.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/412419dbd8466fb98c1a62ae1f064070a9e2451a2d878a588b2edd4019ffd93d.png",
        "kind": "power"
      },
      {
        "name": "Donut Delivery",
        "description": "Swift Step heals nearby allies by 80 Life over 2s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/aa59e89a84c74362f4e922b33fc8e481331acad40887bf08f69e30dbd65a1ef5.png",
        "kind": "power"
      },
      {
        "name": "Talisman of Life",
        "description": "Protection Suzu grants 80 Overhealth for 5s. For each ally affected, reduce Swift Step's cooldown by 1s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/0c68fe10640018c8286f8e66ff734eac9b4496072d79004edeaa718b45e6e88c.png",
        "kind": "power"
      },
      {
        "name": "Our Bikes",
        "description": "After using Kitsune Rush, reset all other ability cooldowns. ­ Allies affected by Kitsune Rush are healed for 80 every 1s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/2fec535b465f4e185b33a6517c0d50ecc06f536220dcf52fe11e7c86587b1f2e.png",
        "kind": "power"
      }
    ]
  },
  "lifeweaver": {
    "items": [
      {
        "name": "Petal Protection",
        "description": "Allies heal 20 health per second while standing on Petal Platform.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/1efd5d2d43a1bcbd135d7fb815d8fa8211d43a0c9aaf9bb091652ebb543e4a6a.png",
        "kind": "perk"
      },
      {
        "name": "Dashing Escape",
        "description": "Rejuvenating Dash's distance is increased by 30%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/3fd45b41f03f1d54652bf4581c7894cbef10a3b6dfe0f3a13132537cf0b4ff58.png",
        "kind": "perk"
      },
      {
        "name": "Sow the Seed",
        "description": "Quick Melee with Healing Blossom to throw a seed. Another ally can pick it up for overhealth and movement speed.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/53c7d91e379667b66889bffbd535f14c62e1dbdfc10622f43c25ad9d3d973291.png",
        "kind": "perk"
      },
      {
        "name": "Superbloom",
        "description": "Thorns detonate for 40 extra damage when enough stick within 2.5 seconds.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/fc70f669169965a725f86e2d4dc21d3bd2f1610b2dd2c1a5b4abb948413e1c05.png",
        "kind": "perk"
      }
    ]
  },
  "lucio": {
    "items": [
      {
        "name": "Soundwave Rider",
        "description": "Wall Riding empowers your next Soundwave, increasing its knockback by 25% and damage by 50%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/5ab9044637d85c3c53022189dbab7913eec2faedc95176069a754441588ac630.png",
        "kind": "perk"
      },
      {
        "name": "Beat Drop",
        "description": "Amp it Up is active during Sound Barrier.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/4639fbbde04ac4e8ca26a56ebd4ddc3f34ccf5c20add8796fe2282a2b2b739fa.png",
        "kind": "perk"
      },
      {
        "name": "Noise Violation",
        "description": "Crossfade's range is increased by 150% while Amp It Up is active.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/37679a0a1cca337b61885f503002dd8698de32df504b0e8de93a627d89afb59f.png",
        "kind": "perk"
      },
      {
        "name": "Accelerando",
        "description": "Gain 15% attack speed while Lucio's Speed Song is active, tripled during Amp It Up.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/c932c84f75d245fb1308f918d80e6a0a9ba93004e40f27e55d63016bd29fb340.png",
        "kind": "perk"
      },
      {
        "name": "Premium Streaming",
        "description": "+50% Projectile Speed.­ Gain 6% Attack Speed for each other ally in Crossfade and heal them equal to 30% of damage dealt. This bonus is doubled during Amp It Up.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/4e0bf7b6feac51efa46f7b6d602427ccc997e8f5505d998365f390a7d83b4d76.png",
        "kind": "power"
      },
      {
        "name": "Mixtape",
        "description": "When switching to Healing Boost, Crossfade heals for 65% of Crossfade healing for every 1s Speed Boost was active.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/8c03751429436e7281c5e971c1f933186fa66a29cde83d4a247a8ce8904f066c.png",
        "kind": "power"
      },
      {
        "name": "Signature Shift",
        "description": "While Amp It Up is active, ­ Sonic Amplifier fires continuously with 80% increased projectile size.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/fb9e381d94957b34f2f0b714c8e470cad20bbea9a882750fe7cca415a3b92f89.png",
        "kind": "power"
      },
      {
        "name": "Fast Forward",
        "description": "Gain up to 30% increased damage and healing based on your current Move Speed and momentum.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/be7aaa36c2b63f206d022f85c8dd5620d14007de5a8f28d7cca01f50bd9e8576.png",
        "kind": "power"
      },
      {
        "name": "Radio Edit",
        "description": "After using Amp It Up, trigger a Sound Barrier with 80% reduced Overhealth.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/96fc28dbb6a7d2878e88e8b6803008a7df3a38ef63a8958765a51a1f5e140d31.png",
        "kind": "power"
      },
      {
        "name": "Vivace",
        "description": "Every 0.5s you are Wallriding or whenever you deal Weapon Damage, gain 1% Move Speed for 5s, stacking up to 30 times.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/ea4ac9102c0c8433b871f3ef166fad243b8139e30d58bc42862c817a0d9e2e90.png",
        "kind": "power"
      },
      {
        "name": "Megaphone",
        "description": "While Amp It Up is active, Crossfade radius is increased by 150% and Weapon Damage increases Amp It Up duration by 0.25s, up to 3s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/3f02e478a4c24e33e7d42f40fbb4588a6d51567ea15a5a069ac52be21b859789.png",
        "kind": "power"
      },
      {
        "name": "Crowd Pleaser",
        "description": "After using Soundwave, heal all allies affected by Crossfade for 40% of Soundwave's damage. This healing is doubled while Amp It Up is active.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/1fdc5b22943f5d8cdb5d17146e5779122e0c1e59f61a2be21169ed45a19dc619.png",
        "kind": "power"
      },
      {
        "name": "Rhythm Rail",
        "description": "Wallriding for 3s charges your next Soundwave, increasing its knockback by 25% and damage by 100%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/8f528d1cd08f40be531976aed80059d5b266b7124d4394c3db55e39675f6a066.png",
        "kind": "power"
      },
      {
        "name": "Reverb",
        "description": "After using Soundwave, for 3s you can use Soundwave again at 50% reduced effectiveness.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/c5902f846b0671536d2d9b90de6b9411271f18f743e6c3b85936c2409a9979d9.png",
        "kind": "power"
      },
      {
        "name": "Beat Drop",
        "description": "Landing with Sound Barrier explodes for 75 damage and can crit for 300% damage. If you spend your Ultimate Charge, Sound Barrier damage is doubled.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/5494c1b9eb16fb339a7aa668da7fe91764a3dbf613d0010105561fdcbae7beaa.png",
        "kind": "power"
      },
      {
        "name": "Hip Hop",
        "description": "After Wallriding, gain an additional jump while Airborne. While Wallriding or Airborne, abilities refresh 10% faster.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/27048c7642ca97e327ac7ceee99e49b2792a2b80578bfcb0c0dff9783cfad3ae.png",
        "kind": "power"
      }
    ]
  },
  "mercy": {
    "items": [
      {
        "name": "Angelic Resurrection",
        "description": "Mercy gains 100 overhealth after casting Resurrect.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/39c6fcef8a4380d73f7714d7276c6559bc25547d0c090631d603d05ed4d6620e.png",
        "kind": "perk"
      },
      {
        "name": "Winged Reach",
        "description": "Guardian Angel's range is increased by 30%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/77e68b4b2cdab6bdbb2509b8dcaf964cbbaffa14523b72d1fe512abc87f3576f.png",
        "kind": "perk"
      },
      {
        "name": "Chain Boost",
        "description": "Caduceus Staff's damage boost is increased by 5% and links to a second nearby ally.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/48d23bc9eebad7092ef2b1895abc99ff1f4207a1ac423a88b8418b388f10f4eb.png",
        "kind": "perk"
      },
      {
        "name": "Double Dose",
        "description": "Flash Heal gains an additional charge but its base healing is reduced by 10.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/e0887d16a296e6419cf0e8a32ed74ceea31bd96efbd25576511516ba0339c870.png",
        "kind": "perk"
      },
      {
        "name": "Threads of Fate",
        "description": "Caduceus Staff chains to your previous target for 3s, at 30% effectiveness.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/6c2b8f1e408305cc2930f7d855c76f076cdcf764f169142d2a6c57e12f136c9f.png",
        "kind": "power"
      },
      {
        "name": "Battle Medic",
        "description": "After swapping to Caduceus Blaster, gain 20% Attack Speed and gain 20% Weapon Lifesteal for 2s for every 1s you spent tethered, up to 20s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/173e541570e7b04c46c7e864cc6dbd6ac6c990f50e93b0d267339a0d40a170bf.png",
        "kind": "power"
      },
      {
        "name": "Renaissance",
        "description": "After succesfully using Resurrect, activate Valkyrie for 5s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/2f5ed69ba39caa68bfe59d4137c539d93d30bfc23c77b322abcf0a6b51bc13b5.png",
        "kind": "power"
      },
      {
        "name": "Equivalent Exchange",
        "description": "You have 3 charges of Resurrect with 33% reduced cast time but their cooldowns no longer refresh. ­ Dealing 750 Caduceus Blaster damage restores 1 charge.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/107e01b28a79d4683333ae5d2048683d81823a7dcf28e70830c88d51f78c5e26.png",
        "kind": "power"
      },
      {
        "name": "The Whambulance",
        "description": "When Guardian Angel ends, heal your target for 4 Life for every 1m you traveled.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/8b0e3c46b8669ae070c45363b5e7a0a83fc26f6858de3e6ad7663cf5ab7cc12b.png",
        "kind": "power"
      },
      {
        "name": "Double Dose",
        "description": "Gain an extra charge of Flash Heal. When Valkyrie is activated, refresh a charge of Flash Heal.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/a6010584ea377ecbf228c51a2b9dd36661bc7b224387bfd0a5a4c3022ca9be61.png",
        "kind": "power"
      },
      {
        "name": "Serenity",
        "description": "Sympathetic Recovery heals for 10% more and heals you even while you are healing a full health ally. ­ Caduceus Staff can overheal up to 50.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/669ba75eef6d99cdd9650fe487ab3b52303011c17fcb86aa21dbce009aa8c103.png",
        "kind": "power"
      },
      {
        "name": "Distortion",
        "description": "When you use Flash Heal, grant the target Overhealth equal to 25% of your Max Life for 2s and knockback enemies 5m around the target.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/e21487b26467b54ad989f83d72e736112163380d040495c5cd14f83ab55b576f.png",
        "kind": "power"
      },
      {
        "name": "First Responder",
        "description": "When you Resurrect an ally, you both gain 250 Overhealth for 6s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/ecc476882d19a2dd3a5cd8dfec5f6d745ac3876a19325a5c2a41432bcb1dbd1d.png",
        "kind": "power"
      },
      {
        "name": "Angelic Acrobatics",
        "description": "+15% Guardian Angel Launch Speed.­ Guardian Angel's cooldown starts as soon as you jump or crouch.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/92d81df64805cfb1a46f20ea8f86ad1d9e5decc91a5583886afcbf4a3485a88e.png",
        "kind": "power"
      },
      {
        "name": "Supply Surge",
        "description": "Flash Heal grants 20% Move Speed, 100% increased cooldown refresh rate, and 20% Lifesteal to the target and you for 2s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/015a233ca13b1f936162b925df75e36bfb0001e4545aad8a58cb22edb89ab55b.png",
        "kind": "power"
      },
      {
        "name": "Tethered Tourniquet",
        "description": "After swapping to Caduceus Blaster, Caduceus Staff automatically heals allies at 100% effectiveness for 2s for every 1s you spent tethered, up to 20s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/65ed56c6951072d064786526adfd042d154fda2b584681bacba20c8700a62cdb.png",
        "kind": "power"
      }
    ]
  },
  "mizuki": {
    "items": [
      {
        "name": "Wellspring",
        "description": "Remedy Aura generation is increased by 25%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/65dc63c40f3f40290ad291f9dda4f981e4cf9980b676946d1b145336b4aa1858.png",
        "kind": "perk"
      },
      {
        "name": "Exposed Soul",
        "description": "Hitting an enemy with Binding Chain increases your damage dealt to them by 30% for 2 seconds.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/44773ab19e89d3732249176897c44c9164c5099e5c8e29599255ba3cc3e29f62.png",
        "kind": "perk"
      },
      {
        "name": "Resonant Return",
        "description": "Healing Kasa bounces one additional time. Each bounce increases its healing by 10.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/f87c6cc1b61157dc4d40cac191544a3ebfa2c0a44b956e8526e6bf6eef6d5351.png",
        "kind": "perk"
      },
      {
        "name": "Quickstep",
        "description": "While Katashiro Return is active, allies within Remedy Aura gain 25% increased movement speed.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/d29b3404035091c9429058c468bef3b7cd9299a366e8fa203ef343177db586bd.png",
        "kind": "perk"
      }
    ]
  },
  "moira": {
    "items": [
      {
        "name": "Destruction's Divide",
        "description": "Coalescence can be toggled between pure healing or pure damage, with 30% greater effect.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/5278bcb65c1456dde7bf000c52953a6f08dfff2264bff6b81e70a1879340804b.png",
        "kind": "perk"
      },
      {
        "name": "Ethical Nourishment",
        "description": "Biotic Orb's first 30 healing is instant on each ally it encounters.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/f2da4eb4ebcd69bfc9a7f7b9be13e9b4aa80ba4828e9b6406c97b3e032de4690.png",
        "kind": "perk"
      },
      {
        "name": "Reversal",
        "description": "Reactivating Biotic Orb reverses its direction.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/202e75ee3c419f82f8557cd12864995d583faded5f6654b043372fd42d4206a7.png",
        "kind": "perk"
      },
      {
        "name": "Phantom Step",
        "description": "Fade lasts 0.5 seconds longer and boosts jump height by 50%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/6d3b8b3719ce56537a1279e91318980d66752490946799643bd5226987115ed6.png",
        "kind": "perk"
      },
      {
        "name": "Necrotic Orb",
        "description": "Ability: Use Reload to send out an Orb that deals up to 35 damage and reduces damage dealt by enemies hit by 30% for 3s.­ (8s Cooldown).",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/1089ac32ed575f635a316871ba78cc4639b83a18f32fca32858c027053749707.png",
        "kind": "power"
      },
      {
        "name": "Ethereal Excision",
        "description": "Using Biotic Grasp or Coalescence on a target affected by an Orb deals 20% critical damage or healing.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/69591e73ceca9cbb3e47052be7f790b992f34449de4556771be20251e86152c3.png",
        "kind": "power"
      },
      {
        "name": "Chain Grasp",
        "description": "After using an ability or Gadget, Biotic Grasp's secondary fire chains to 2 additional enemies within 10m for 2s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/1a48ae89a5d3cc5e26f9c5223a8422ff239d62377d6e542b8ad49a65350d8fd0.png",
        "kind": "power"
      },
      {
        "name": "Cross-Orbal",
        "description": "Biotic Orb launches an additional Biotic Orb of the other type with 60% reduced capacity.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/5032de2aad339f6db1b52e27ad865660f63a4b0d449b5f92b33616df9bfcf9c5.png",
        "kind": "power"
      },
      {
        "name": "Multiball",
        "description": "Biotic Orb launches 2 additional orbs of the chosen type with 85% reduced effectiveness.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/0d4c504d85592e8df3f48df6745330ea2bce726e4e7baf2fdb099508963e86b8.png",
        "kind": "power"
      },
      {
        "name": "Phantasm",
        "description": "When you use Fade, spawn a stationary copy of the last selected Biotic Orb with 50% reduced duration and 50% reduced capacity.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/a0f1669ac69433e16b23c589150210ba01a251e7a6757932842e9416e242a04d.png",
        "kind": "power"
      },
      {
        "name": "Precarious Potency",
        "description": "Allies healed by your Biotic Grasp are healed for an additional 25% of Biotic Grasp's healing over 5s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/acf3ba12a09637855c0d62272b1a022c8bd4e35ee9fbda65afa89dcc88034b8a.png",
        "kind": "power"
      },
      {
        "name": "Voidhoppers",
        "description": "While using Fade, passing through a target grants you Overhealth equal to 10% of your Max Life. Passing through an ally also grants them the Overhealth and phases them briefly.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/d63f5b29cef10de1b136fb6f97cfdffdedbcd1ab793855deb6bb1286bfec69c7.png",
        "kind": "power"
      },
      {
        "name": "Remote Reciprocity",
        "description": "After doing 300 Biotic Grasp healing, gain 25% Biotic Grasp Secondary Fire range and deal 15% increased damage for 5s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/84441b014ae1ad20726d14c8c8ed21ac1af32822aaa6870dd7389d8481f73419.png",
        "kind": "power"
      },
      {
        "name": "Orbsplosion",
        "description": "Recast Biotic Orb to explode all active Biotic Orbs, healing up to 45% or dealing damage up to 30% of the Biotic Orb's max capacity.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/fbd3f1465790c769f8b9f90f5e356975014a0c2c5673e8b690df6ba4f226aa6a.png",
        "kind": "power"
      },
      {
        "name": "Spectral Beam",
        "description": "If you pass through an enemy during Fade, cast Coalescence for 1.25s at 100% effectiveness. For every additional enemy, cast for 0.75s longer. ",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/56b963337c7610e15121fdfc6bb0e3c85a62b4cd9f8bd3d0ff37a18898baf6f4.png",
        "kind": "power"
      },
      {
        "name": "Destruction's Divide",
        "description": "+25% Ultimate Cost Reduction.­ Coalescence can be toggled between pure healing or pure damage, with 30% greater effect.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/a92cc9e47f3aa0baafb9762619df9bb6a04a859142db090cd88c06aefdbe9864.png",
        "kind": "power"
      }
    ]
  },
  "wuyang": {
    "items": [
      {
        "name": "Overflow",
        "description": "Gain 10 ammo and 50% healing resource when Rushing Torrent is activated.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/4159af4f1e6cb3fa0879727deec0d07d151a8b96e883b4b2e13ab570d840d514.png",
        "kind": "perk"
      },
      {
        "name": "Balance",
        "description": "When you deal damage with water orbs, increase Restorative Stream's passive healing by 30% for 2 seconds.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/0ef4ae1adde715d22a18b57810ede98b0ed61b649d71364b0077ffe3dbb965fc.png",
        "kind": "perk"
      },
      {
        "name": "Ebb and Flow",
        "description": "Guardian Wave rewinds to its starting location.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/ce177940cb80eb007a9b845861407335caf18048affe226b1e2c39b4a01c6b22.png",
        "kind": "perk"
      },
      {
        "name": "Falling Rain",
        "description": "Simultaneously control 3 water orbs that deal 60% decreased damage and have 25% decreased empowered explosion radius.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/b4b736a801ab836d8c66825bb8dfc7051333b54f42406ef79520c11d43159a7a.png",
        "kind": "perk"
      },
      {
        "name": "Undertow",
        "description": "For each Water Orb hit, gain 10% Restorative Stream Energy and reduce ability cooldowns by 0.5s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/d1dde07926595660b9a4b7f1fec09137634d06a6820454b69d264c59cce28f2c.png",
        "kind": "power"
      },
      {
        "name": "Ripple Sense",
        "description": "Empowered Water Orb can be steered more freely and has 35% increased explosion radius. Every 5s, your next Water Orb will reveal all enemies within 8m on impact for 5s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/a61130e7ffd3f772947a785b34d5f0e8b6c3b43a6159807aab7f3a9b39dcdda3.png",
        "kind": "power"
      },
      {
        "name": "Paindrops",
        "description": "After using an ability or Gadget, your next 2 Water Orbs shoot 2 additional orbs that each deal 20% damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/de9ce3c741be3c97311708cf8aa0e26ef939884c184cae0a4626fd3051d47642.png",
        "kind": "power"
      },
      {
        "name": "Flow State",
        "description": "While Rushing Torrent is active, every 50 damage or 75 healing dealt extends the duration of Rushing Torrent by 1s, up to 5s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/6a418f5270e104ee9938503b7ab8166fd478c14b1f50c507bf469858ba86acc4.png",
        "kind": "power"
      },
      {
        "name": "Bifurcation",
        "description": "After using an ability, your Active Restorative Stream chains to the previous target with 100% healing for 4s. You can place an additional Passive Restorative Stream.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/06e7b55e1d5ebd346adfe74799f88a06a1e359f5d70deff9859e6bb01250c9f0.png",
        "kind": "power"
      },
      {
        "name": "Tidal Save",
        "description": "Guardian Wave heals allies with Passive Restorative Stream for an extra 75% over 4s and restores 15% Restorative Stream Energy for each target hit.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/62c3ccdc39c148c3ef62488a10433b18394923d22679b12d40a32f0c7ee4f781.png",
        "kind": "power"
      },
      {
        "name": "Streamline",
        "description": "While Rushing Torrent is activated, place Passive Restorative Stream on all other allies within line of sight with 25% reduced healing.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/d828c6e15dc1906e9fc06f9ad9df16338140b1fb761b722002e017f667943f33.png",
        "kind": "power"
      },
      {
        "name": "Puddle Stomp",
        "description": "While Rushing Torrent is active, landing from a jump heals all allies within 6m for 75 for every 1s spent falling.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/dab8325fffb9ac74a7bb8e4ad5586bf0479b3ecd04a106df745b0d092723c24b.png",
        "kind": "power"
      },
      {
        "name": "Splash Strike",
        "description": "While Rushing Torrent is active, using Quick Melee while Airborne creates a short Guardian Wave with 75% effectiveness around you.­ (8s Cooldown).",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/c0e5f9d468b80cd35992a47b2af2982d1e16709a6bd4c1392182ee6c5dc0ebe3.png",
        "kind": "power"
      },
      {
        "name": "Waveshatter",
        "description": "Guardian Wave can crit enemies at close ranges and gains up to 150% more width and 75% more effectiveness based on time spent travelling downwards.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/1c3a089cf98a249287cc6c59b29a9a975969d3c243b5668658a9a26750dda2cd.png",
        "kind": "power"
      },
      {
        "name": "Current Confluence",
        "description": "+25% Restorative Stream Duration.­ Allies affected by Passive Restorative Stream or Guardian Wave's Increased Healing Effect are healed for 30% of damage you deal.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/927dd21315b1801fec8f66305a3e18907003182211544a0c544786b5f57c3d37.png",
        "kind": "power"
      },
      {
        "name": "Ebb and Flow",
        "description": "Guardian Wave rewinds to its starting location with 50% damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/377c635375815bd58648ecebc1ccee8804dcf32a8877ae7a59d9bbc32a2e798c.png",
        "kind": "power"
      }
    ]
  },
  "zenyatta": {
    "items": [
      {
        "name": "Discordant Repair",
        "description": "Zenyatta gains 10% lifesteal against enemies with Discord Orb.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/9f317bc17cfa00574118e7a32fe2853e0a9a6fe71abcdae996dabacd58b3adf2.png",
        "kind": "perk"
      },
      {
        "name": "Ascendance",
        "description": "Activate and hold Double Jump to hover for up to 3 seconds.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/54dffa6e3725551b4c14147386ed29351e495f2571401dbfc9e51034764025c5.png",
        "kind": "perk"
      },
      {
        "name": "Focused Destruction",
        "description": "Secondary Fire charges 20% faster and can store 1 extra Orb of Destruction.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/95348852bb0e41f8e9dd66917be4d89f9536daa7afa660c9212dc3fd3ca5826e.png",
        "kind": "perk"
      },
      {
        "name": "Dual Harmony",
        "description": "Gain a 2nd Harmony Orb but they both heal for 70% effectiveness.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/9898f52ec09a2846050183112728e3baa06bd46061897644db6423f357486628.png",
        "kind": "perk"
      },
      {
        "name": "Flying Kick",
        "description": "Ability: While airborne, Quick Melee becomes a dash kick that deals 25% bonus damage. It stuns and deals 40 damage if the target hits a wall.­ (5s Cooldown).",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/de4398cc9c130b47d1973f5ce64fb923e3b5d837acebd165b338a93a236cbca4.png",
        "kind": "power"
      },
      {
        "name": "It's Orbin' Time",
        "description": "Orb of Destruction's secondary fire can charge up to 3 additional orbs.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/2e9a0ac087661ae3695c70cbac8cfd58994c20061f09ea69381d3790d2514c5d.png",
        "kind": "power"
      },
      {
        "name": "Enlightenment",
        "description": "Allies affected by Harmony Orb are healed for 30% of the damage you deal.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/913c17034b2e1b7e49beb6d89a1000eaad95d581a4e397c0480d5c86219fa205.png",
        "kind": "power"
      },
      {
        "name": "Dual Harmony",
        "description": "Gain a 2nd Harmony Orb but they both heal 35% less.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/ab1fc8f0c05229678fe3f72ec8fba51b4e73ad1930eb6fdf506b2b5dfcf88a29.png",
        "kind": "power"
      },
      {
        "name": "Gotta Have Faith",
        "description": "Harmony Orb targets can be out of your line of sight for 10s longer before Harmony Orb returns to you.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/828cb12ac52fa7e532aa9ca05ba2fd56777db6fa79f3999105bc7106388150e5.png",
        "kind": "power"
      },
      {
        "name": "Inner Peace",
        "description": "Gain a Harmony Orb that is always attached to you. It has 80% reduced effectiveness.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/bb76d0683b7ad5449ba76647fc31ffc2b37a4add2641b201cf6444b728927448.png",
        "kind": "power"
      },
      {
        "name": "Discord Inferno",
        "description": "When you critically hit a target affected by your Discord Orb, the Orb of Destruction explodes, dealing­ 50 damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/c445b59c6c22c5b04d266bde95cc1daf12e9a435d302412aac57a01d1d680c82.png",
        "kind": "power"
      },
      {
        "name": "Discord Fever",
        "description": "When Discord Orb is applied to a target, they take 50 damage over 5s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/4c9677f64d9d5132fc62618749d9e8680774601aec9a60e4ce14f23ae88766db.png",
        "kind": "power"
      },
      {
        "name": "Instant Karma",
        "description": "When a target of your Discord Orb damages you, heal 25% of that damage over 2s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/dd9d131c49422e27a17da22502c9655a445b4ed34af28f01c0a5b7a77282ab0c.png",
        "kind": "power"
      },
      {
        "name": "Circle of Strife",
        "description": "While using Transcendence, apply Discord Orb to all enemies within range.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/40e1d4bfe1a17beef30561097a94c0bd1793cd752026b84d37f2e8009f023b5c.png",
        "kind": "power"
      },
      {
        "name": "Soul Control",
        "description": "Transcendence can be canceled early, saving up to 65% of your Ultimate Charge.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/9e19030dbd9011d199fc74c22ad3ed09220d032f1735aa870524741cfa6c4a96.png",
        "kind": "power"
      },
      {
        "name": "Sharpened Focus",
        "description": "Orb of Destruction's Secondary Fire charges 20% faster. While charging, gain 5% Move Speed and Overhealth equal to 5% of your Max Life for every Orb charged.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/0bc299d35e70b957117e13a31ecf5fc664a9195c120d669a1c35ddc01e72d9bb.png",
        "kind": "power"
      }
    ]
  },
  "dva": {
    "items": [
      {
        "name": "Bunny Power",
        "description": "Eject grants 75 temporary overhealth and Call Mech’s damage radius is increased by 50%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/54ead00f47feb653f1f96d36df958d12a4d8134f800e6047985011ee5e636f2c.png",
        "kind": "perk"
      },
      {
        "name": "Extended Boosters",
        "description": "Hitting an enemy with Boosters deals 40% increased damage and extends the duration by 0.5 seconds.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/b608a2bec9030da11e1ba0aaaa09276ab5bbd50f5c4b29b937c6fea7292145b0.png",
        "kind": "perk"
      },
      {
        "name": "Shield System",
        "description": "Convert 100 health to shields. Defense Matrix restores shields based on 25% of its damage absorbed.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/8c050a50706ca610e8a4500865366d993e644125f1b2a987e6c763d9cc5d7763.png",
        "kind": "perk"
      },
      {
        "name": "Precision Fusion",
        "description": "Press R to reduce Fusion Cannons' spread by 75% for 3 seconds.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/8399d146264d0b180cf50a2e96661d7ae408a4a7eb60cad67c80812a18c35f1a.png",
        "kind": "perk"
      },
      {
        "name": "Focused Fusion",
        "description": "Fusion Cannon's spread is reduced by 50% and damage falloff range is 20m farther.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/4e5f80e449e15f22243b522b7f4788e49a96b76f3ff1af38cfa11705a0cbf9f1.png",
        "kind": "power"
      },
      {
        "name": "Legendary Loadout",
        "description": "Micro Missiles are replaced with­ 6 Heavy Rockets, which deal 375% more explosive damage and have 100% increased radius.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/34dc9a03cac007bb3618ef6f29a04168a881ebcd579f803472cb1ce5910f30b9.png",
        "kind": "power"
      },
      {
        "name": "Overstocked",
        "description": "Gain 1 extra charge of Micro Missiles.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/62d923a0ba84247bdd2415a30fb45fbad4ce91e06193590f2722c0e53e6b941f.png",
        "kind": "power"
      },
      {
        "name": "Countermeasures",
        "description": "When you mitigate 150 damage with Defense Matrix, automatically fire 2 Micro Missiles.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/c120124c6fbd7c1e3a0532248ff17e39a3c87a7b1f7a4f22d54d4391eb65fe99.png",
        "kind": "power"
      },
      {
        "name": "Ignition Burst",
        "description": "Boosters knockback Burns enemies for 60 damage over 3s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/f7e58d1ccbf0061a3b8023d857dbcf822fc9fb6029c09e53fa7c424bf997f363.png",
        "kind": "power"
      },
      {
        "name": "MEKA Punch",
        "description": "While using Boosters, Quick Melee has 50% more Attack Speed. ­ Quick Melee eliminations reset the cooldown of Boosters.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/a8cc2e6f7e3735d6a0d53c9618e969ab0e8b33156afeae9b834696f51ed7b139.png",
        "kind": "power"
      },
      {
        "name": "Tokki Slam",
        "description": "During Boosters, use Crouch to slam the ground, dealing damage equal to 25% of your max Armor and Shields and knocking up enemies hit.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/5a8b44f9b79be7c9d3cdaabc50a36a1c358a39f6cb6b8505ad849fdc10bac7bb.png",
        "kind": "power"
      },
      {
        "name": "Facetanking",
        "description": "Defense Matrix heals you for­ 30% of the damage it blocks.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/2ee0c2e2a60bb65a73ce13281784be911c6c418344cf9c68e2f856e3688d0566.png",
        "kind": "power"
      },
      {
        "name": "Stat Boost",
        "description": "During the first 2s of Boosters, Defense Matrix recovers 125% faster.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/ff5b3b5778e84194a63e14ba7b4f26ed63485bffdb886d27fc550ddb3307d800.png",
        "kind": "power"
      },
      {
        "name": "Express Detonation",
        "description": "+50% Call Mech Radius­ Self-Destruct explodes 15% faster.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/7ac621d3abe95810c681fe17a482617c1ad26bc87d07a1d979d55f1c1124cf22.png",
        "kind": "power"
      },
      {
        "name": "Nano Cola™ Nitrous",
        "description": "While ejected from your Mech, gain 40% bonus Max Life and 30% Move Speed.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/df1b48ee1dca09202e15400e4d89a89dfe34ef7feac7b7480e3924be69d31b2f.png",
        "kind": "power"
      },
      {
        "name": "Multi-Task Mod",
        "description": "Fusion Cannons can now be fired while using Defense Matrix.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/ce99dda2b5305cf52b04536599cf851a8b84926fb775b6417100d8f32341240b.png",
        "kind": "power"
      }
    ]
  },
  "domina": {
    "items": [
      {
        "name": "Efficient Design",
        "description": "After using Barrier Array, restore 50 shields and activate passive health regeneration.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/e875e96eb7ae576aadb73eda105c4c75c7d6ee8e838db32d7f157e381eaff665.png",
        "kind": "perk"
      },
      {
        "name": "Extended Power",
        "description": "Increase the range of Photon Magnum by 20%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/8525083a67878879365273e04f3a6b2f8585b804f457a4b34b005d52204a70cc.png",
        "kind": "perk"
      },
      {
        "name": "Disruptive Detonation",
        "description": "Enemies hit by Crystal Charge's explosion are slowed by 30% for 2 seconds.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/7dc9179235d865d3d3725fec2c7dce9a042a727dd2715028e30484ca97610336.png",
        "kind": "perk"
      },
      {
        "name": "Corporate Retreat",
        "description": "While Barrier Array is active, it can be moved one time to another location.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/6006092e920e1e719a22090967108f164083e4217a748fabfc00eb905724b421.png",
        "kind": "perk"
      }
    ]
  },
  "doomfist": {
    "items": [
      {
        "name": "One-Two",
        "description": "Hitting an enemy into a wall with Rocket Punch reloads Hand Cannon and overfills ammo by 2.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/cba3de1c0d4fa0f5283b1a5490952d52ba3e6de9b1e01fde4241bf3bfe453b07.png",
        "kind": "perk"
      },
      {
        "name": "Survival of the Fittest",
        "description": "The Best Defense grants 25 overhealth from eliminations and its max overhealth is increased by 50.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/0eaf218a00f6a8070c4ead8272cb00113022d89d145a94bf3cebb812b062798f.png",
        "kind": "perk"
      },
      {
        "name": "Aftershock",
        "description": "Enemies hit by Seismic Slam are slowed by 40% for 2 seconds.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/8fd3cab5cd978820e2d79bf8180d3b76bfdf22cdf622cf8671bba3924385f025.png",
        "kind": "perk"
      },
      {
        "name": "Power Matrix",
        "description": "Power Block absorbs projectiles for the first 0.8 seconds of its duration.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/0b831053f68b3255806c0da470c2c8b9a8fff17f5bd04839bba0fa407618ea43.png",
        "kind": "perk"
      },
      {
        "name": "Rising Uppercut",
        "description": "Ability: Your next Quick Melee becomes a Rising Uppercut, dealing 20 extra damage.­ (10s Cooldown).",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/52fa3792b4c66492712e732c54da999819fda29a550cde7f675a46f3a8fcea10.png",
        "kind": "power"
      },
      {
        "name": "Jab Cross",
        "description": "After you use an ability, gain 75% Attack Speed and increase Quick Melee Range by 1m for 0.75s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/58bf95123e1593da2500009bdcf1168ca220915bbe3a563ccfa804307e18b79e.png",
        "kind": "power"
      },
      {
        "name": "The Bestest Defense",
        "description": "Quick Melee hits and Hand Cannon critical hits trigger The Best Defense at 50% effectiveness.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/93b7f32e85530d6af6b820b0062d2809e4e84a34b2c1dbb920719564a11025a5.png",
        "kind": "power"
      },
      {
        "name": "Slam Wham",
        "description": "Increase Seismic Slam's damage up to 75% and range up to 50% based on time airborne.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/4c947e64ddd5a6a2fb315fdeed1e0bae01eacf6f9e7613ec9b5cbada82a5f7fa.png",
        "kind": "power"
      },
      {
        "name": "Overpowered",
        "description": "Rocket Punch can be further empowered when blocking 150% more damage with Power Block, granting 50% more damage and 50% more range.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/c3a15585ebd9c7d041a114d7105438b4e4fda55472c733b3b5a788361fe62b6b.png",
        "kind": "power"
      },
      {
        "name": "Jetforce Jab",
        "description": "Rocket Punch can go through multiple enemies and Burns them for 20% bonus damage over 3s. ",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/34dd61a4ba9e9157f7295971c0eae7e9ae6e9d9b2eccad2083f68312e5f27f65.png",
        "kind": "power"
      },
      {
        "name": "Boomfist",
        "description": "Hitting multiple enemies with Rocket Punch grants 5% Ultimate Charge and reduces the cooldown of Power Block by 0.5s for each extra enemy hit.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/ab1ac917b7081362378078f9b03642b1e5916a9f2554b488cbde37f82c6d9c39.png",
        "kind": "power"
      },
      {
        "name": "Asteroid Smash",
        "description": "Ability: Crouching while airborne will trigger a mini Meteor Strike, pulling down enemies and dealing up to 150 damage based on distance traveled.­ (8s Cooldown).",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/8a12cc1c39496900631198798e9ecc2b4f3a2d3e7de675c0e5c16b44eece8672.png",
        "kind": "power"
      },
      {
        "name": "Aftershock",
        "description": "Seismic Slam's shockwave repeats itself after a 1.5s delay, dealing 40% damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/07b2f0e7b68b10062c11235a4f9f51941c08d995537cf36c83df928872480a5d.png",
        "kind": "power"
      },
      {
        "name": "Seismic Rally",
        "description": "Every 1s while leaping with ­ Seismic Slam, grant Overhealth equal to 5% of your Max Life to all allies within line of sight for 3s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/14895f255fd00841041d6fa54d2c0cd24316d57ddfd3e63a52ca9f0881051759.png",
        "kind": "power"
      },
      {
        "name": "Block Party",
        "description": "While Power Block is active, heal yourself for 8% of Max Life and all other allies within 8m for 20% of Max Life every 1s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/2d84e4f16732d5805e0bd09e0e7f570a91174540501c599e7493fc162861397d.png",
        "kind": "power"
      },
      {
        "name": "Helping Hand",
        "description": "The Best Defense grants bonus Overhealth equal to 10% of Bonus Max Life. Whenever you gain Overhealth from yourself, grant 25% to the nearest ally.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/21dc9b637cc7f408bab4e58b1299c255d5987b6b29c47381ae7c4c4ffe84728b.png",
        "kind": "power"
      }
    ]
  },
  "hazard": {
    "items": [
      {
        "name": "Reconstitution",
        "description": "Jagged Wall hits overfill Spike Guard with 25% additional energy.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/62bfe61a4ea9e9152030ab3b52d52d16eeb5db74fdb1109d1e9545e79011d62c.png",
        "kind": "perk"
      },
      {
        "name": "Anarchic Zeal",
        "description": "Spike Guard's spikes gain 40% Lifesteal.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/5769d726c1fd432aee499cc0adfc4812a82bd3a928af713302de5157e03986cd.png",
        "kind": "perk"
      },
      {
        "name": "Deep Leap",
        "description": "Violent Leap's range is increased by 20%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/26384e47df6a6723ce3a777ae72b667f60f4bdf317ac87bd01df4af34dbb95b9.png",
        "kind": "perk"
      },
      {
        "name": "Explosive Impalements",
        "description": "Bonespur hits mark targets with spikes. Quick Melee and Violent Leap's slash detonate them for 30 explosive damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/d6c6cff5997b09cc6c02c03b0d2bfce48afc4bbf3f95717ea337f633af985b5f.png",
        "kind": "perk"
      },
      {
        "name": "Bonerot",
        "description": "Dealing 6 instances of Weapon Damage marks targets with spikes. Quick Melee and Violent Leap's slash detonates them for 60 damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/6d4a543a57b312deaf55649ec71c1ee6ad8512aedc9aac224ce54074351f1514.png",
        "kind": "power"
      },
      {
        "name": "Barbed Shot",
        "description": "Bonespur shots also fire 2 Spike Guard spikes at hit targets for 8 damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/faafd5b22d8d9abaf1cbc2c2fb086d0d716a20cea0acccf1265fb7ba09873c00.png",
        "kind": "power"
      },
      {
        "name": "Needle Storm",
        "description": "Spike Guard now fires at all enemies in front of Hazard.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/25bebf648d7cf7d68610c274b8441d800a1bc9262b81f17966a8946cbc81ba38.png",
        "kind": "power"
      },
      {
        "name": "Twin Fang",
        "description": "Every 3rd shot of Bonespur fires a free second shot for 75% damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/74add3b6ea336a4b7a5fee2932eded0f8f9dce6bdcca64016fec3a2fd9a5c8c0.png",
        "kind": "power"
      },
      {
        "name": "Woof Woof!",
        "description": "After using Violent Leap, gain 50% Spike Guard Range for 3s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/177f0a18a5b78d8e5dc8e4a5377387e85f606a3e0adac922dfa76574e11758bd.png",
        "kind": "power"
      },
      {
        "name": "Bunny Hop",
        "description": "Using Violent Leap without using Slash refunds 2s of cooldown for Violent Leap and Jagged Wall and grants nearby allies Overhealth equal to 10% of your Max Life for 3s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/9effe3d5424062591a3b03ff77038ff7ab8aab0d8c48747f3c2f1c5ba151a1f2.png",
        "kind": "power"
      },
      {
        "name": "Slasher",
        "description": "Violent Leap's slash shoots a piercing projectile that deals 80 damage, ignoring enemies within 7m.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/493605f8982492011124410f990a2feedc056fec599897b24bd6ddf2d48cafd9.png",
        "kind": "power"
      },
      {
        "name": "Off The Wall",
        "description": "When Jagged Wall is spawned, knock back enemies within 8m after 1.5s for 40 damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/00f5c52a8483258d425b2a1d222f0e546c7ba67294bc300053a0b2834a4fc01a.png",
        "kind": "power"
      },
      {
        "name": "Juiced",
        "description": "When Jagged Wall is spawned, heal all allies within 8m by 20% of your Max Life over 3s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/ea2216f77250a7fa6b6c2906ceb18ab6fd259228b7489c9d41c2cd67c9c8a2a8.png",
        "kind": "power"
      },
      {
        "name": "Fortress",
        "description": "Jagged Wall becomes 35% larger.­ Jagged Wall knockback applies 25 additional damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/fbe46335367a4c7fe06df9b52636948c71b264ca2fdffc16649a42c54c6991f9.png",
        "kind": "power"
      },
      {
        "name": "Bringin' the Pain",
        "description": "Downpour costs 20% less Ultimate Charge.­ After using Downpour, immediately reset all cooldowns and gain 25% Cooldown Reduction for 10s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/1e4f24d0ff194b31d8e2f2419df1f6763a49aaeb882bd5cc4dbdb2bacca5607e.png",
        "kind": "power"
      },
      {
        "name": "Boomslang's Blaster",
        "description": "Ability: Use Quick Melee during ­ Spike Guard to immediately fire 5 spikes at targets. ­ (10s Cooldown).",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/6996fa2c844da731a780b89272321aa042848376db23b9d5e8ad461fc1462d21.png",
        "kind": "power"
      }
    ]
  },
  "junker-queen": {
    "items": [
      {
        "name": "Rampant Charge",
        "description": "Gain Unstoppable and reduce all cooldowns by 6 seconds when using Rampage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/69acb5b21896563bbddc2d166f1d53b31ab96257adec55ca0fb20a9d38f1e726.png",
        "kind": "perk"
      },
      {
        "name": "Battle Shout",
        "description": "Commanding Shout fully reloads Scatter Gun and increases allied reload speed by 50%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/c0c7a9fabfe1e722d591074d61212cd951ca241daf4f857e16277520f66a7bf2.png",
        "kind": "perk"
      },
      {
        "name": "Willy-Willy",
        "description": "When recalling Jagged Blade, its radius is increased by 100% and it deals 30 additional impact damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/79f03361567257341b863613a591508eca0077c5b934a590f6ed34822616f005.png",
        "kind": "perk"
      },
      {
        "name": "Savage Satiation",
        "description": "Carnage's impact damage gains 100% lifesteal.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/6f359a8501d72e8e4b4fcceff1dc353b68a4303bfb5e0f853d894b2478d0bce4.png",
        "kind": "perk"
      },
      {
        "name": "Thrill of Battle",
        "description": "Adrenaline Rush also heals allies within 12m for 100% of the amount it heals you.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/06b53d6ad961d5a46828f2e3110debfb3aa0816178e2051fc941d67fa3c47e24.png",
        "kind": "power"
      },
      {
        "name": "Royal Bullets",
        "description": "Scattergun critical hit applies Wound for 20 damage over 2s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/bc232dc49be74ecaf5b0ef70b36dd37c0acd8b670a84ff68f701499e53873bfe.png",
        "kind": "power"
      },
      {
        "name": "Twist The Knife",
        "description": "Scattergun critical hits extend the duration of all Wounds on the target by 2s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/86d077b3b6328abfa74e05ae362eb9bb3e52924d0eea70901b5069a2f01d9e97.png",
        "kind": "power"
      },
      {
        "name": "Blade Parade",
        "description": "Holding Jagged Blade charges it, increasing its damage up to 75% and projectile speed up to 200%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/9b79d7cde0eb8dddfc0659de6bdc373ea7f917499a997066a8a67b2f1ed5a1ce.png",
        "kind": "power"
      },
      {
        "name": "Cut 'Em, Gracie!",
        "description": "Each enemy hit by Jagged Blade reduces its cooldown by 1s.­ When recalling Jagged Blade, its radius is increased by 100% and deals 40 impact damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/2f7e17251cd601d8437ccaa6b0d575836b478024468fbff10c4aca91b4bcb02a.png",
        "kind": "power"
      },
      {
        "name": "Merciless Magnetism",
        "description": "Jagged Blade can crit for 50% bonus damage.­ Jagged Blade's pull strength is increased by 50%. When Jagged Blade crits, this bonus is doubled.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/b3a3763c22b2af6ba95c2d385d89c837ba13d4c7fd571a5b9667921ba931284c.png",
        "kind": "power"
      },
      {
        "name": "Soaring Stone",
        "description": "Carnage becomes a leaping strike if you jump during its cast time.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/eeeb27c37aa86b8e67d477c68e2f4fedf26e4dff4cb938ef938c42af66cac447.png",
        "kind": "power"
      },
      {
        "name": "Chop Chop",
        "description": "Carnage gains an additional charge but its cooldown reduction per hit is reduced to 1s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/f8583624b7fb340d9a657f2b7981c1668f83ab6ed1896082fe11e84ad7f9e6e6.png",
        "kind": "power"
      },
      {
        "name": "Reckoner's Roar",
        "description": "Using Commanding Shout Wounds enemies within 10m­ for 30 damage over 3s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/2472715603967ac835bec4d8c5261402487b093c08f536120ab1a96b057f731a.png",
        "kind": "power"
      },
      {
        "name": "Let's Go Win",
        "description": "Elimination reduces the cooldown of Jagged Blade and Commanding Shout by 50%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/9ea5d49a0e1f4747b889a8c18dd7d4e99ab928d06e4db11dfbc1d5a75f46de0e.png",
        "kind": "power"
      },
      {
        "name": "Bloodcrazed",
        "description": "Rampage and Carnage gives 15% of Max Life as Overhealth per hit, up to 45%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/3ba63c0639cce68a291666c75790293c7161b28a0ba2531a6e4aa12d8946a90a.png",
        "kind": "power"
      },
      {
        "name": "Bow Down",
        "description": "While casting Rampage, become  Unstoppable and reset all ability cooldowns. Rampage knocks down enemies hit for 1.5s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/ffa2d0eef50379ed5e1beb0ee4ceaf4beb154bb81aed71ff10745bce024b5f98.png",
        "kind": "power"
      }
    ]
  },
  "mauga": {
    "items": [
      {
        "name": "Kinetic Bandolier",
        "description": "Overrun reloads up to 150 ammo during the first second of charging.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/6adca5324793138777cdd09152168778785188b1d32962e42df933638ab49321.png",
        "kind": "perk"
      },
      {
        "name": "Pyromaniac",
        "description": "Igniting enemies with Incendiary Chaingun grants 50 overhealth.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/3b22a3f8c185339e203c006abf3b40ef16074f8439855dcd27ecbf3779f46792.png",
        "kind": "perk"
      },
      {
        "name": "Firewalker",
        "description": "Overrun ignites enemies hit.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/83b13a8976492b76d22ef89abd6815e90fcc7f3133853d86a9e898bc07db8c5a.png",
        "kind": "perk"
      },
      {
        "name": "Combat Fuel",
        "description": "Critical hits grant Mauga 3 temporary overhealth on Cardiac Overdrive's next use, up to 150 overhealth.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/69aae6d3636721510e30bc9d1578944c8e9705ab403d9e421798aceebf0f1a9b.png",
        "kind": "perk"
      }
    ]
  },
  "orisa": {
    "items": [
      {
        "name": "Defense Protocol",
        "description": "Regenerate 100 health per second while charging Terra Surge.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/319851240bac7253ea1601534c66860a126c2f6a9bd6af56bdb25265c3521fe0.png",
        "kind": "perk"
      },
      {
        "name": "Mobile Fortification",
        "description": "While Fortify is active, Orisa has no movement speed reduction and no heat generation.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/02ffaf6f362417f64e8bd50919d2d2d5d9238c2f9a7e168b3d68192c4c604004.png",
        "kind": "perk"
      },
      {
        "name": "Charged Javelin",
        "description": "Hold  to charge Energy Javelin, increasing its knockback up to 25% and its projectile speed up to 100%. Pierces enemies at full power.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/79fbe7ca9c3b645dd510dbf395d3741d89ea7d2c9ff9edb2c157951ba45f0852.png",
        "kind": "perk"
      },
      {
        "name": "Protective Barrier",
        "description": "Convert Javelin Spin to instead launch a barrier.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/88b6e3613c49bf6c6edbd2e32fb8aaa71ba58d556ff0d6403688d1ceabc70f31.png",
        "kind": "perk"
      },
      {
        "name": "Scorched Earth",
        "description": "When you Overheat, apply Burning to enemies within 6m, dealing damage equal to 20% of your max Life over 4s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/d512603dac9e047bddff2ca41a7a6f936f99d4c982b7f6518b179a3977ab1f0a.png",
        "kind": "power"
      },
      {
        "name": "Shield Divergence",
        "description": "When you Overheat, deploy a Barrier with 500 Health in front.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/91e7aedc69dba390284292c5230bbe797aa7b2444017fdfa70180a6433e2ad1d.png",
        "kind": "power"
      },
      {
        "name": "Advanced Throwbotics",
        "description": "When you use Javelin Spin, launch an Energy Javelin with 75% damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/7944de41aa6118197eb623857b571a94429ec0f65071c5f79cb4a0e1f2706f62.png",
        "kind": "power"
      },
      {
        "name": "Spynstem Update",
        "description": "Javelin Spin now deflects projectiles and grants 20% of damage dealt from deflecting as Ultimate Charge.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/f7f0150b326f2dc0876a31d388b2e959da8056f5e814af72647edad065dc8a04.png",
        "kind": "power"
      },
      {
        "name": "Core Cooling",
        "description": "While Fortify is active, reduce Heat generated by 90% and gain 10% Attack Speed.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/c34242dfd6b9bda44ad52fcb88d959658f03aedf62596304cf67f4e92ac3ca21.png",
        "kind": "power"
      },
      {
        "name": "Lassoed",
        "description": "On impact, Energy Javelin will pull enemies within 4m towards itself. Gain 3% Ultimate Charge for each enemy pulled.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/9a2843c600d386aab73dfcde90cb5dff0544acb9027fda0160d996784b0ba5f9.png",
        "kind": "power"
      },
      {
        "name": "Critical Charger",
        "description": "Energy Javelin can crit for 75% bonus damage.­ Energy Javelin can be charged for up to 200% projectile speed and pierces enemies at full power.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/9a071410a839610f6404c25c974117abf89f02d9161082f7017d9462fb4f39b3.png",
        "kind": "power"
      },
      {
        "name": "Hooves of Steel",
        "description": "After Fortify ends, gain Shields equal to 60% of the Weapon Damage dealt during Fortify, up to 200. Resets when you next use Fortify.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/4812792f7c42138a5baae6569482792917e644290f1d930cae0aab95a851ecb1.png",
        "kind": "power"
      },
      {
        "name": "Restortify",
        "description": "While Fortify is active, heal for 5% of your max Life every second.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/2b11756059592d674ff5d5ed80c2de9703c06145e2f1a2dd64750b6e71176b9e.png",
        "kind": "power"
      },
      {
        "name": "Centripetal Charge",
        "description": "25% Ultimate Cost Reduction.­ After using Terra Surge, reset your ability cooldowns.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/5b2dd473e81266b66bac6817dd7df4522948c5ec06072792fab5adb9bd703cd2.png",
        "kind": "power"
      },
      {
        "name": "Supercharger",
        "description": "When you use Terra Surge, drop a Supercharger that increases the damage of nearby allies by 25% for 15s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/d8832081806b0b8a475b3e5f5d6ce3b393509564ab33acdc952f22e7d2babd89.png",
        "kind": "power"
      },
      {
        "name": "Oladele-copter Blades",
        "description": "While using Javelin Spin and Terra Surge, gain free flight and 20% Move Speed, but Terra Surge deals 50% reduced damage. ",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/5f8b387563d75daa886f18d6083cea99ed40c99c4418f682f4fc3e2a61c1707e.png",
        "kind": "power"
      }
    ]
  },
  "ramattra": {
    "items": [
      {
        "name": "Relentless Form",
        "description": "While Nemesis Form is active, eliminations extend the duration by 2 second. Half duration gained during Annihilation.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/8671fcad5ba90ab73fe1c01d831801d5ecac6f9b75bf1bbabde065d2277dc4de.png",
        "kind": "perk"
      },
      {
        "name": "Prolonged Barrier",
        "description": "Void Barrier's duration and size is increased by 25%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/b94428b88e5858d65ac4a0f9800c344ecd11c9f31698d42d55a9f3ab4df241cb.png",
        "kind": "perk"
      },
      {
        "name": "Void Surge",
        "description": "Void Accelerator periodically releases a burst of 6 additional projectiles during continuous fire.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/8c4ab35a42b172b78cc2124f5c6098e1da757ff31c2c73e51d45c43b0b382bb2.png",
        "kind": "perk"
      },
      {
        "name": "Nanite Repair",
        "description": "Ramattra is healed for 100 health per second while within Ravenous Vortex.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/0f01814ad4c072dbbaddb1f15e72178f6bb5e7bc2c0eb3874c9f5838f98e30e7.png",
        "kind": "perk"
      },
      {
        "name": "Void Surge",
        "description": "Void Accelerator periodically releases a burst of 6 additional projectiles during continuous fire.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/32636017041b65a53481cc29c6ef2b93b784698b7ad2c2a5e859b410dfc9cbe9.png",
        "kind": "power"
      },
      {
        "name": "Void Blight",
        "description": "Void Accelerator infects enemies with nanites which explode for 30 damage after dealing 100 damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/a8388b23f3c4bbcdc7824bbdffaf59cc68af74eb5565db204e02534aee9343dc.png",
        "kind": "power"
      },
      {
        "name": "Recursion Relay",
        "description": "+25% Void Barrier size.­ Void Accelerator projectile and Pummel that passes through the Void Barrier gain 15% increased damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/632f5168dce33d201aa6c98a46bfda56cdae8d93e7c221ed2597ae279f8dc54d.png",
        "kind": "power"
      },
      {
        "name": "Ramparts",
        "description": "Void Barrier gains an additional charge.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/d4865fade8ab7ec0954ac56312f30cc84e1554402b0fe27b1eba870d3820adc1.png",
        "kind": "power"
      },
      {
        "name": "Second Phase",
        "description": "When Nemesis Form is activated, reduce the cooldown of Ravenous Vortex by 75%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/dbca93c9bda7ea35cb4b54543d33f96822796fe949e87259e92d9aa8b90c9331.png",
        "kind": "power"
      },
      {
        "name": "Final Form",
        "description": "When Nemesis Form is active, you are healed for 50 per second while within Ravenous Vortex.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/8d8cc472eefeeb45c6c9b061945d1a1fba4c95f5a28a4f0ee058dbea0b837777.png",
        "kind": "power"
      },
      {
        "name": "Breakout",
        "description": "While blocking in Nemesis Form, use Pummel to perform a dashing punch. ­ (4s Cooldown).",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/1314a818aab24e99d00c392a6954381d4890f218edc76242b1ce5cb68dee105e.png",
        "kind": "power"
      },
      {
        "name": "Retaliation",
        "description": "Releasing Block deals damage equal to 100% of the amount mitigated, up to 150 to enemies within 6m.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/5eb3e2861cd79449389d0b2da50cd9cbea883a43d1abba90170ae2c080e58168.png",
        "kind": "power"
      },
      {
        "name": "Conversion Protocol",
        "description": "Block heals you for 25% of damage mitigated over 3s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/83074c126510b55de5d11707e7176b1b5e9ac532eedc56610a172d079940fd73.png",
        "kind": "power"
      },
      {
        "name": "Insatiable Spiral",
        "description": "+50% Ravenous Vortex Radius­ +30% Ravenous Vortex Damage",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/a39bd0368b5af928941a782122edea9938d83be4c0af65c8e671a04c3c02a905.png",
        "kind": "power"
      },
      {
        "name": "Ravaging Vortex",
        "description": "When Ravenous Vortex is detonated, deal 50 damage and gain 2% Ultimate Charge per enemy hit.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/410ca9bd41801415c92a430fee5e455a962fb0e2a7e332232d43c4e5cb381efa.png",
        "kind": "power"
      },
      {
        "name": "Dreadknight",
        "description": "+50% Annihilation Damage­ +1s Annihilation Duration",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/a58a9f41476c917e662c47eba5f80f240572a8844c724431d0d7deeaba474f14.png",
        "kind": "power"
      }
    ]
  },
  "reinhardt": {
    "items": [
      {
        "name": "Crusader's Fire",
        "description": "Refund a charge of Fire Strike when you stun an enemy, overfilling up to 3.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/c52c47ea96e1485d5eefb4b968b8ddd3c85705023f9696f4d5ea9c70887e060f.png",
        "kind": "perk"
      },
      {
        "name": "Crusader's Resolve",
        "description": "While using Barrier Field, your passive health regeneration triggers 75% sooner.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/c5b0de9c882813ed237ae4822f9059b9c496f5b249ceeb79fdb2fbc4cff05e07.png",
        "kind": "perk"
      },
      {
        "name": "Shield Slam",
        "description": "While Barrier Field is active, use  to damage and knockback enemies.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/f439f368062a58b9ee190afb5d4ea3ad28692d298600292f1f47e6e68151d108.png",
        "kind": "perk"
      },
      {
        "name": "Ignited Fury",
        "description": "For each enemy you hit with Fire Strike, gain 2 seconds of 25% increased attack speed.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/543ee152a75898b667a5c0a0127326b36716df02b6e2baace4bb0d9784571c6a.png",
        "kind": "perk"
      },
      {
        "name": "To Me, My Friends!",
        "description": "While Barrier Field is active,­ allies within 5m are healed equal to 3% of your Max Life every 1s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/7d8c9cde8cf0c6271822358ae61ae8369cd9699901fc3375918a6657cf6e76ee.png",
        "kind": "power"
      },
      {
        "name": "Crusader Slam",
        "description": "Ability: While Barrier Field is active, use Primary Fire to deal Melee Damage equal to 5% of Barrier Field Health.­ (8s Cooldown).",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/49d553c41c749232ffda28ccaa2a086f12c674b4d18a50d6e6e81b63aedde36c.png",
        "kind": "power"
      },
      {
        "name": "Iron Drift",
        "description": "+200% Charge Duration.­ Charge can pin multiple enemies and can be slowed by holding backwards.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/8b0fa0f2f73c7644a995263d610e576e3e60a7b75cd54c53264eb3db0908e0cf.png",
        "kind": "power"
      },
      {
        "name": "Shield Stampede",
        "description": "+50% Charge Knockback Power.­ During Charge, automatically deploy Barrier Field.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/c94188063d2c79557efe29d97ba101edf0bb3bce0c3c959d80a7b99a9cd5b443.png",
        "kind": "power"
      },
      {
        "name": "Barrier Reconstruction",
        "description": "When you deal Melee damage or Fire Strike damage, restore health to Barrier Field equal to 15% of Barrier Field Health.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/3528cf7525110eb543ed2142912d60a393ce367eefe53df0ebd8b0d2a926b501.png",
        "kind": "power"
      },
      {
        "name": "Vroom Boom Boom",
        "description": "During Charge, colliding with a wall triggers an explosion that deals 30% of Charge's pin damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/39e0ec6b441ce77063e9aa42cf9451adf21b7cdaec1e0161162cdb2e2f8353cd.png",
        "kind": "power"
      },
      {
        "name": "Impact Burst",
        "description": "Fire Strike triggers an explosion the first time it hits an enemy, dealing 30% Fire Strike damage to other enemies in a 3m radius.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/bc7ffc87109b14cc7c6c103bf69572624420a5e78310a65c530949b5f5a88549.png",
        "kind": "power"
      },
      {
        "name": "Magma Strike",
        "description": "Every second Fire Strike leaves a trail of lava for 2s that Burns enemies for 50% of Fire Strike damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/f876f67baf5326ea66bec9a03c4fa3cdaf3b6cdbf08f152bb3143b02aecde442.png",
        "kind": "power"
      },
      {
        "name": "Blazing Blitz",
        "description": "+25% Starting Ultimate Charge.­ After using Earthshatter, every Rocket Hammer swing launches a Fire Strike for 5s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/4336a5fe70c65099f198bd1ca091853358578cac9bb57bc9f217efb788aafe21.png",
        "kind": "power"
      },
      {
        "name": "Smashing!",
        "description": "When you deal damage with Rocket Hammer, gain 1% Move Speed and 3% Weapon Lifesteal for 2s, stacking up to 10 times.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/04f832b661fbb6543b516382866bb334b964dcf7b0c6459755a08af8c5ec9a77.png",
        "kind": "power"
      },
      {
        "name": "Feeling The Burn",
        "description": "Every 3rd Rocket Hammer swing applies Burn, dealing 30% ­ Rocket Hammer damage over 2s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/c683f40cc52c930217b4b6f58599d2a38fcf8270f4204ac02e0da5cb107b2733.png",
        "kind": "power"
      },
      {
        "name": "Infusion Generator",
        "description": "Increase Barrier Field Health by 250% of your Bonus Max Life.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/7287d56b6115932f77547b8538cb1772f22d2155b5734727a993603e1d79db83.png",
        "kind": "power"
      }
    ]
  },
  "roadhog": {
    "items": [
      {
        "name": "Scrap Hook",
        "description": "Chain Hook hits reload 2 ammo.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/2ca8a50b6b369d47a33ec5d4a3e42e12ca1aebb8144a29d959a134fb4226934a.png",
        "kind": "perk"
      },
      {
        "name": "Shrapnel Launcher",
        "description": "Extend the range of Scrap Gun's secondary fire by 50% and tighten its burst spread by 25%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/d48d0b264d765e3732abda784e986595f7a6c5ad0e56f1929c008ffc0492a39d.png",
        "kind": "perk"
      },
      {
        "name": "Hogdrogen Exposure",
        "description": "Take A Breather also heals nearby allies for 50% of its healing.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/bbeb9d0110d04466eda5f4a845bd27685f80703264c967c0cf224f1b99d6f49d.png",
        "kind": "perk"
      },
      {
        "name": "Pulled Pork",
        "description": "Gain overhealth based on how far you pull enemies with Chain Hook, up to 300.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/db9a0129262448dad0c5f70558b561d77b40c9bc721c0cae1dd75a7ed647d4b7.png",
        "kind": "perk"
      }
    ]
  },
  "sigma": {
    "items": [
      {
        "name": "Kinetic Cycle",
        "description": "Absorbing projectiles with Kinetic Grasp also reduces Accretion's cooldown.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/f22dbfb1aaeff73f2fea11906bf431b2063f68160ba54473337c24a8d01cc524.png",
        "kind": "perk"
      },
      {
        "name": "Hyper Regeneration",
        "description": "30% of Hyperspheres' damage restores Experimental Barrier's health.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/a6f10bff0408ce201f848449e2ae55ae8b2f368b42165090922b08854a90cb86.png",
        "kind": "perk"
      },
      {
        "name": "Hyper Strike",
        "description": "Every 5 direct hits with Hyperspheres, your next successful Quick Melee levitates and knocks away enemies.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/f5bbae6e666458d5d8a382c67056ea3cf0ce0781d575c540a6afb58267e92027.png",
        "kind": "perk"
      },
      {
        "name": "Levitation",
        "description": "Activate and hold Double Jump to briefly levitate upward.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/15828d0a39a88da3687e84e52a1a119fb0b5b08812e11c356bfffb8fe90d8a41.png",
        "kind": "perk"
      },
      {
        "name": "Zero Gravity",
        "description": "When you use an ability or Gadget, gain the ability to fly for 2.5s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/635507ba8a721861467259f0a33d970af6e6001d555728a63ed057850b72e99e.png",
        "kind": "power"
      },
      {
        "name": "Trinisphere",
        "description": "Your primary fire launches a third Hypersphere that deals 50% damage. ",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/e1bad9da7b8b7ff618bdfd72d85b3752867514acdae0c33e61dc419b927103be.png",
        "kind": "power"
      },
      {
        "name": "Symphonic Syzygy",
        "description": "When Kinetic Grasp ends, for every 50 damage absorbed gain 10% Attack Speed for 4s, stacking up to­ 4 times.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/94b0fcd93cfcbcc0edfab098bbef8b32106f5d095aa3ca454149e5ba9451d04a.png",
        "kind": "power"
      },
      {
        "name": "Event Horizon",
        "description": "Damage absorbed by Kinetic Grasp grants Overhealth to visible allies and restores Experimental Barrier's health. Excess is converted to Overhealth.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/f06a3e8153f2bcac73e7255a67c5a6ec7ce6d06e3dccce780aaa9274c3a6554c.png",
        "kind": "power"
      },
      {
        "name": "Philharmonic Fortitude",
        "description": "Experimental Barrier has 25% increased Max Health. Barrier health regenerates constantly but 50% slower while deployed.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/cd07cb8524693184c8fcd0ebcd8651170abbc140e0a5215efb03fe1f8a0462cd.png",
        "kind": "power"
      },
      {
        "name": "Orbital Barrier",
        "description": "Get a mini Experimental Barrier that orbits around you. It has 50% reduced health.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/5cc714152adc66d7cb8f031fb4b0d5cf720b92b7dec2583231a8b41ed2e3ff3a.png",
        "kind": "power"
      },
      {
        "name": "Singularity",
        "description": "Accretion splash damage is increased by 75% and enemies are pulled towards its explosion.­ Accretion's cooldown is reduced by 35% on direct hit.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/ee0d77bd9ab0fbaeaf27c7124702a1c631ac988b23c3e8a573128719c807e948.png",
        "kind": "power"
      },
      {
        "name": "Hyperloop",
        "description": "Hyperspheres direct hits reduce the cooldown of Accretion by 0.8s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/84bfa3c4e33110555897f4a6982fbb583e378ad23df781f7c80a2fb046b8a340.png",
        "kind": "power"
      },
      {
        "name": "Maestro",
        "description": "50% Ultimate Cost Reduction.­ Gravitic Flux Radius is reduced­ by 35% and refunds 50% of Ultimate Charge if no enemies are affected.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/bb5971c5862a93112eb572b2a36459219766d70699efa9887ec2b664592a9e7c.png",
        "kind": "power"
      },
      {
        "name": "Apogee Alignment",
        "description": "When you use an ability, create 2 Hyperspheres that orbit around you that deals 75% damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/be3340f5b03d2f938cea9d1c55797fb09c5f063e022a64313d87366851e2672c.png",
        "kind": "power"
      },
      {
        "name": "Astrophysical",
        "description": "Ability: Quick Melee causes enemies hit to levitate into the air for 1s.­ (10s Cooldown).",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/8894b1edacfd8e5ed3769e34c7a93919dea2a6f802f201db78af8bc0ba545586.png",
        "kind": "power"
      },
      {
        "name": "Mass Driver",
        "description": "Accretion projectiles that pass through Experimental Barrier gain 300% Projectile Speed, deal 25% increased damage, and restore 150 Experimental Barrier health.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/52360bc3548af72cbd8ff5d3c1436a1a5b89133b38d4a3175b26cd7da642c2f0.png",
        "kind": "power"
      }
    ]
  },
  "winston": {
    "items": [
      {
        "name": "Electric Charge",
        "description": "Winston gains 10% movement speed for each enemy he is damaging with Tesla Cannon's primary fire, up to 30%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/cd3ce407e3817830cf930bdf156b96669a9d811f73a2ed9cd421e6b27b64cc9c.png",
        "kind": "perk"
      },
      {
        "name": "Heavy Landing",
        "description": "During Primal Rage, Jump Pack's damage and area increase by up to 75% while airborne.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/e75d5742d239f04d14979fee4015ecd173b21786324b88739721b1b75db500fa.png",
        "kind": "perk"
      },
      {
        "name": "Chain Lightning",
        "description": "Fully charged Secondary Fire hits bounce to up to 2 additional targets.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/07057b7cb8a72dfe55a0880562ab4afbe9a056e226e19c3c1ae6e2fa88d59c14.png",
        "kind": "perk"
      },
      {
        "name": "Revitalizing Barrier",
        "description": "Barrier Projector heals allies within it for 30 health per second.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/92c7620c5f92eb1eabb51b9ffeeab93e6be9e0966e7981b3cf515f3fe6ae27ae.png",
        "kind": "perk"
      },
      {
        "name": "Circuit Breaker",
        "description": "Gain 10% of Electric damage as Overhealth, up to 100.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/3cbbb8cd62de717d1f1cc1d2cc9bbb67358c01bc944cf0e4be6e18b775d88f6e.png",
        "kind": "power"
      },
      {
        "name": "Electro Cluster",
        "description": "+15% Tesla Cannon Primary Fire Max Range.­ Tesla Cannon's Primary Fire deals 2% increased damage per enemy being hit.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/4385a8a2df9b9889caae26c687337d9e6f76130de92c92aa28b11738237f225f.png",
        "kind": "power"
      },
      {
        "name": "Lightning Rod",
        "description": "Hits with Tesla Cannon's fully charged secondary fire bounce to all other enemies within 8m for 75% damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/6216e1e560e4bbdc485fffe1f26279299e2585e90b7076db3b0d96b4650d2a53.png",
        "kind": "power"
      },
      {
        "name": "Volatile Volt",
        "description": "Tesla Cannon's Secondary Fire can critically hit for 250% damage. ",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/780a131dc7bdbf7cbbc08967a0894babb44633e9839fba7c8bb29769b88c9e00.png",
        "kind": "power"
      },
      {
        "name": "Primal Punch",
        "description": "Melee or Jump Pack or Tesla Cannon Secondary Fire eliminations reset Jump Pack cooldown.­ For every 25 Armor you have, gain 3% Melee damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/0feea0c3fc6f11582413e7f2bd80fd3b1b760c1e8bb65af8f371fa1b423619c0.png",
        "kind": "power"
      },
      {
        "name": "Moon Landing",
        "description": "Heal for 7% of Max Life per enemy damaged by Jump Pack's landing.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/37a017c8475db804963a55d6d52b394f5f7cc8bb6ea479ec98ee9e26683dd358.png",
        "kind": "power"
      },
      {
        "name": "Lunar Leap",
        "description": "Gain 3% bonus Ultimate Charge per enemy damaged by Jump Pack's landing. While using Jump Pack, gain 5% of Max Life as Overhealth every 1s, up to 100.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/c032becef92faadfd188a31588e586f0f3a474cc9e2dfc2ee665ee3392167b75.png",
        "kind": "power"
      },
      {
        "name": "Pocket Projector",
        "description": "Activating Barrier Projector attaches an additional, smaller Barrier Projector to Winston with 10% health.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/a9fd594fc653013c400ab59428c12e6c246f66883e9040d57c47c827b3b5ea2f.png",
        "kind": "power"
      },
      {
        "name": "Tesla Field",
        "description": "Enemies within Barrier Projector take 40 Electric damage every 1s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/94632d32a0ab20eb557e1fedb2e1b66388951848aa8be208242b5bb925c33a45.png",
        "kind": "power"
      },
      {
        "name": "Surge Protector",
        "description": "Allies within Barrier Projector are healed for 30 every 1s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/61673596c861f65b334a112002b3906ea2f20f683f9df560a53d53e7b3d1ed7c.png",
        "kind": "power"
      },
      {
        "name": "Primal Slam",
        "description": "While using Jump Pack, press Jump to quickly slam toward your crosshair. During Primal Rage, slam speed is increased by 50%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/762f3c690e9ef1681de2e6b870b69d00ec5333afbd0b90eab785eba4f163e834.png",
        "kind": "power"
      },
      {
        "name": "Lucheng Launchers",
        "description": "Jump Pack's damage becomes Electric and increases by up to 75% while airborne. During Primal Rage, this is doubled.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/f13da00c1319c4599df3c53fdd4bdbf3008cdb3975d39b89f0dc15bfbdfa7c0d.png",
        "kind": "power"
      }
    ]
  },
  "wrecking-ball": {
    "items": [
      {
        "name": "Steamroller",
        "description": "Roll impacts deal 100% more damage to Tanks.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/61ba1ca38638f3d83c7feaf3370ae8040c72bc49e77bad42a311d36031363155.png",
        "kind": "perk"
      },
      {
        "name": "Multi-Ball",
        "description": "Press Q within 5 seconds after using Minefield to deploy 7 additional mines.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/e542dc40c07eeb35f2c0c4c01e30357c408a8d343c14d6b177e6a904644a2a18.png",
        "kind": "perk"
      },
      {
        "name": "Hang Time",
        "description": "Piledriver winds up longer, gaining air control and dealing up to 50% more damage.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/3647153c08c0af7933fa49fff4669ff44db4fb20aa893a047307c08da5288115.png",
        "kind": "perk"
      },
      {
        "name": "Adaptive Barrier",
        "description": "Adaptive Shield generates a 1.5 second barrier on activation.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/91c944d1e02f4bf1619b3b2f81d4af774a08c61d2974ee956e501dfc21a20f41.png",
        "kind": "perk"
      }
    ]
  },
  "zarya": {
    "items": [
      {
        "name": "Jump-Ups",
        "description": "Secondary Fire's self-knockback is increased by 75%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/a1c471e92b4c70a11e2ad276fcc7589f653ae06cdfb0e38967a4593653866de6.png",
        "kind": "perk"
      },
      {
        "name": "Spotter",
        "description": "Projected Barrier activates ally health regeneration and increases their movement speed by 20%.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/198c67146cb8a79d7584fab1a0762bc9bba2f37e24852bf716dc9587acffecbc.png",
        "kind": "perk"
      },
      {
        "name": "Extra Oomph",
        "description": "While a Barrier is active, dealing damage with Particle Cannon's beam generates energy.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/e1327b5d6c493bf9a2b89e7c6a0e68d6fbb5f5dd3f1291b648534ddb68f2dc44.png",
        "kind": "perk"
      },
      {
        "name": "Energy Lance",
        "description": "Particle Cannon's beam pierces enemies.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/7592ce85cb4ce0f6bc90aeca6da706a2e73dcc42f31372553c8fa44c501931ea.png",
        "kind": "perk"
      },
      {
        "name": "Charged Link",
        "description": "Particle Cannon's Secondary Fire hits grant 2 Energy and increase Particle Cannon's Primary Fire range by 20% for 3s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/97df5c9f1dc42764d06fe94fd5bdd38846177de7778467c5ed7af662b724245c.png",
        "kind": "power"
      },
      {
        "name": "Pre-Workout",
        "description": "Gain Weapon Lifesteal and Ability Lifesteal equal to 15% of Energy.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/7ce7b566b830f76f4ca649a3d2a75239c607bf951bbac8d70ce230bcb5c82da8.png",
        "kind": "power"
      },
      {
        "name": "No Limits",
        "description": "Maximum Energy increased to 150. Energy always decays above 100 Energy at a 150% faster rate.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/a5b878a2f24f417c4d836d29f5053decc82833b0270ec63c9a2bff5532a0b1d6.png",
        "kind": "power"
      },
      {
        "name": "Particle Accelerator",
        "description": "Gain 20% Attack Speed for Particle Cannon's secondary fire. After using an ability, quintuple this bonus for 5s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/0d115dfc5676fd0158123d2231b1b76532236f253611182ce1859e592bb32ca9.png",
        "kind": "power"
      },
      {
        "name": "Volskaya Vortex",
        "description": "After a Barrier is cast, Particle Cannon's next secondary fire spawns a slowing vortex that deals 60 damage over 2s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/b4cbb64b250480e6aac75f4499ef1327c3d69eb8f91fbb3425cd2bdb1b5b4c24.png",
        "kind": "power"
      },
      {
        "name": "Lifelift",
        "description": "+50% Particle Barrier Size. ­ Increase Barrier Health by 50% of Bonus Max Life from Items.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/bb30ae03ba7c3787757d81432ef2a532e9476ee059a564e3f3304baef2fa4d19.png",
        "kind": "power"
      },
      {
        "name": "Barrier Benefits",
        "description": "When Barriers expire, grant Overhealth equal to 100% of remaining Barrier Health to the target for 2s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/01c64a3544ee107a295cca8735560cc605ee27e104bde3581f99179397686c73.png",
        "kind": "power"
      },
      {
        "name": "Major Flex",
        "description": "Barrier knocks back and deals 25 damage, increased by Energy, to enemies within 5m every 1s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/3199fe8d2c220d3d00154631295ef4eb5f476c7ae2d9d9047eda185b2083cab7.png",
        "kind": "power"
      },
      {
        "name": "Containment Shield",
        "description": "Barrier heals the target for 5% of your Max Life every 1s and grants 20% Move Speed while active.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/fc1346800627778d854636b0504b9caa4e2dcd5a80147f7367b8b05ad038bc89.png",
        "kind": "power"
      },
      {
        "name": "Here To Spot You",
        "description": "+20% Projected Barrier Range.­ Projected Barrier pulls you to the targeted ally and heals you for 30% of Max Life over 3s.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/e6e9fee9c7fb9e511d5adf94d8a5a4a4a0257ba49ea4b04bc303f7eaced5afb5.png",
        "kind": "power"
      },
      {
        "name": "Fission Field",
        "description": "Projected Barrier also applies to 1 additional ally within 10m, but has 25% reduced maximum Energy gain and 20% reduced duration.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/d48740d6c23fa7bf49d75ff1db1c7a9258c38b10c1c6b0d3605e903261431b4c.png",
        "kind": "power"
      },
      {
        "name": "Graviton Anomaly",
        "description": "+25% Ultimate Cost Reduction­ Graviton Surge base damage is increased to 30 and increased by Energy, but has 25% reduced duration.",
        "icon": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/c13e547f9cf6597bf0f80aa9b494388c90a5a23554551784549a8e5849cac1b1.png",
        "kind": "power"
      }
    ]
  }
};

var subroles = {
  "ja-jp": {
    "flanker": "フランカー",
    "recon": "リコン",
    "sharpshooter": "シャープシューター",
    "specialist": "スペシャリスト",
    "medic": "メディック",
    "survivor": "サバイバー",
    "tactician": "タクティシャン",
    "bruiser": "ブルーザー",
    "initiator": "イニシエーター",
    "stalwart": "スタルワート"
  },
  "pt-br": {
    "flanker": "Flanqueador",
    "recon": "Reconhecimento",
    "sharpshooter": "Atirador de elite",
    "specialist": "Especialista",
    "medic": "Médico",
    "survivor": "Sobrevivente",
    "tactician": "Estrategista",
    "bruiser": "Brigão",
    "initiator": "Iniciador",
    "stalwart": "Defensor"
  },
  "fr-fr": {
    "flanker": "Flanqueur",
    "recon": "Reconnaissance",
    "sharpshooter": "Tireur d’élite",
    "specialist": "Spécialiste",
    "medic": "Médecin",
    "survivor": "Survivant",
    "tactician": "Tacticien",
    "bruiser": "Bagarreur",
    "initiator": "Initiateur",
    "stalwart": "Rempart"
  },
  "de-de": {
    "flanker": "Flanker",
    "recon": "Aufklärung",
    "sharpshooter": "Scharfschütze",
    "specialist": "Spezialist",
    "medic": "Sanitäter",
    "survivor": "Überlebenskünstler",
    "tactician": "Taktiker",
    "bruiser": "Schläger",
    "initiator": "Initiator",
    "stalwart": "Bollwerk"
  },
  "ko-kr": {
    "flanker": "측면 공격",
    "recon": "정찰",
    "sharpshooter": "저격수",
    "specialist": "전문가",
    "medic": "의무병",
    "survivor": "생존가",
    "tactician": "전술가",
    "bruiser": "난투가",
    "initiator": "선봉",
    "stalwart": "수호자"
  }
};

var titles = {
  "es-mx": "Selector aleatorio de héroes",
  "es-es": "Selector aleatorio de héroes",
  "en-us": "Random Hero Picker",
  "ja-jp": "ランダムヒーローピッカー",
  "pt-br": "Seletor aleatório de heróis",
  "fr-fr": "Sélecteur aléatoire de héros",
  "de-de": "Zufällige Heldenauswahl",
  "ko-kr": "무작위 영웅 선택기"
};

var headerSubtitles = {
  "es-mx": "SELECTOR ALEATORIO DE HÉROES",
  "es-es": "SELECTOR ALEATORIO DE HÉROES",
  "en-us": "RANDOM HERO PICKER",
  "ja-jp": "ランダムヒーローピッカー",
  "pt-br": "SELETOR ALEATÓRIO DE HERÓIS",
  "fr-fr": "SÉLECTEUR ALÉATOIRE DE HÉROS",
  "de-de": "ZUFÄLLIGE HELDENAUSWAHL",
  "ko-kr": "무작위 영웅 선택기"
};

function buildUi(locale, fallback) {
    var result = {};
    var key;
    if (fallback) for (key in fallback) result[key] = fallback[key];
    var extra = translations[locale];
    if (extra) for (key in extra) result[key] = extra[key];
    return result;
}

function heroName(locale, key, fallback) {
    var names = heroNames[locale];
    return names && names[key] ? names[key] : fallback;
}

function subroleName(locale, key, fallback) {
    var names = subroles[locale];
    return names && names[key] ? names[key] : fallback;
}
