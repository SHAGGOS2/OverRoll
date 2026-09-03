import { useEffect } from 'react'
import type { SupportedLocale } from './localization'

type Dict = Record<string, string>

const en: Dict = {
  'Preparar partida': 'Prepare match',
  'Configuración': 'Configuration',
  'Ocultar': 'Hide',
  'Editar': 'Edit',
  'Perfil': 'Profile',
  'Escuadra': 'Squad',
  'Reglas': 'Rules',
  'Modo de perfiles': 'Profile mode',
  'Sin perfil': 'No profile',
  'Todos los marcados': 'All marked',
  'Descubrir': 'Discover',
  'Practicar': 'Practice',
  'Excluir no usados': 'Exclude unused',
  'Favoritos': 'Favorites',
  'Solo Main': 'Main only',
  'Ignora los perfiles. Usa cualquier héroe permitido por roles y filtros.': 'Ignores profiles. Uses any hero allowed by roles and filters.',
  'Elige por igual entre Main, Usado, Jugado y No usado.': 'Chooses evenly between Main, Used, Played and Unused.',
  'Da más oportunidad a héroes menos familiares para crear variedad.': 'Gives less familiar heroes a better chance for more variety.',
  'Usa héroes marcados como Jugado o No usado.': 'Uses heroes marked as Played or Unused.',
  'Usa Main, Usado o Jugado y evita los marcados como No usado.': 'Uses Main, Used or Played and avoids heroes marked Unused.',
  'Usa solamente héroes Main y Usado.': 'Uses only Main and Used heroes.',
  'Busca héroes Main y vuelve al catálogo permitido si el rol no tiene ninguno.': 'Looks for Main heroes and falls back to the allowed catalog when a role has none.',
  'Nombres, perfiles, filtros y roles': 'Names, profiles, filters and roles',
  'Nombres, perfiles y grupos permitidos': 'Names, profiles and allowed groups',
  'Nombres, perfiles y filtros': 'Names, profiles and filters',
  'Nombres': 'Names',
  'Revolver': 'Shuffle',
  'Roles': 'Roles',
  'Clases': 'Classes',
  'Ajustes de generación': 'Generation settings',
  'Ajustes exclusivos de TF2': 'TF2-specific settings',
  'Ajustes exclusivos de PVZ GW2': 'PVZ GW2-specific settings',
  'Evitar repetidos': 'Avoid duplicates',
  'Evitar clases repetidas': 'Avoid duplicate classes',
  'Evitar personajes repetidos': 'Avoid duplicate characters',
  'Un héroe por equipo': 'One hero per team',
  'Una clase por jugador cuando sea posible': 'One class per player when possible',
  'Una variante por ficha cuando sea posible': 'One variant per slot when possible',
  'No repite personajes mientras existan alternativas válidas.': 'Avoids duplicate characters while valid alternatives exist.',
  'Composición de roles': 'Role composition',
  'Distribución automática': 'Automatic distribution',
  'Acomoda automáticamente una composición válida para el tamaño del equipo.': 'Automatically builds a valid composition for the team size.',
  'Perks aleatorias': 'Random perks',
  'Una menor y una mayor': 'One minor and one major',
  'Cuatro poderes Stadium': 'Four Stadium powers',
  'Modo Stadium': 'Stadium mode',
  'Solo héroes compatibles': 'Compatible heroes only',
  'Solo rol': 'Role only',
  'Oculta los héroes': 'Hides heroes',
  'Priorizar Team-Ups': 'Prioritize Team-Ups',
  'Favorece sinergias, pero conserva filtros, roles y bloqueo de repetidos.': 'Favors synergies while keeping filters, roles and duplicate blocking.',
  'Loadout completo': 'Full loadout',
  'Especialización, arma y tres artefactos únicos por ficha.': 'Specialization, weapon and three unique gadgets per slot.',
  'Usar variantes': 'Use variants',
  'Incluye todas las variantes del catálogo': 'Includes every catalog variant',
  'Incluir personajes DLC': 'Include DLC characters',
  'Agrega personajes especiales y desbloqueables': 'Adds special and unlockable characters',
  'Permitir cambio de bando': 'Allow side switching',
  'El botón de ficha reemplaza el resultado al instante': 'The card button replaces the result instantly',
  'Plantas disponibles': 'Available Plants',
  'Zombis disponibles': 'Available Zombies',
  'Generar plantas': 'Generate Plants',
  'Generar zombis': 'Generate Zombies',
  'Generar ambos': 'Generate both',
  'Selector principal': 'Main picker',
  'Modo Mercenarios': 'Mercenary mode',
  'Selector por facción': 'Faction picker',
  'Generar imagen': 'Generate image',
  'Generar equipo': 'Generate team',
  'Generar candidatos': 'Generate candidates',
  'Generando…': 'Generating…',
  'Preparando…': 'Preparing…',
  'Composición': 'Composition',
  'Fijados': 'Locked',
  'Catálogo': 'Catalog',
  'Formato': 'Format',
  'Jugadores': 'Players',
  'Repetidos': 'Duplicates',
  'Plantas': 'Plants',
  'Zombis': 'Zombies',
  'Sí': 'Yes',
  'No': 'No',
  'Sin selección': 'No selection',
  'Genera un equipo': 'Generate a team',
  'Genera este bando': 'Generate this side',
  'Equipamiento': 'Loadout',
  'Poderes equipados': 'Equipped powers',
  'Predeterminado': 'Default',
  'VARIANTE': 'VARIANT',
  'CLASE BASE': 'BASE CLASS',
  'MENOR': 'MINOR',
  'MAYOR': 'MAJOR',
  'PODER': 'POWER',
  'MERCENARIO': 'MERCENARY',
  'Ofensiva': 'Offense',
  'Defensa': 'Defense',
  'Apoyo': 'Support',
  'Tanque': 'Tank',
  'Daño': 'Damage',
  'Superviviente': 'Survivor',
  'Luchador': 'Brawler',
  'Táctico': 'Tactician',
  'Tirador': 'Marksman',
  'Reconocimiento': 'Recon',
  'Flanqueador': 'Flanker',
  'Iniciador': 'Initiator',
  'Especialista': 'Specialist',
  'Médico': 'Medic',
  'Vanguardia': 'Vanguard',
  'Duelista': 'Duelist',
  'Estratega': 'Strategist',
  'Flexible': 'Flexible',
  'Controlador': 'Controller',
  'Centinela': 'Sentinel',
  'Asesino': 'Assassin',
  'Versátil': 'All-rounder',
  'Control de área': 'Area control',
  'Control': 'Control',
  'Ofensivo': 'Offensive',
  'Ligero': 'Light',
  'Medio': 'Medium',
  'Pesado': 'Heavy',
  'Flanco': 'Flank',
  'Asalto': 'Assault',
  'Escaramuza': 'Skirmisher',
  'Héroe': 'Hero',
  'Team-Ups y roles': 'Team-Ups and roles',
  'Agentes por rol': 'Agents by role',
  'Tres preferencias por jugador': 'Three preferences per player',
  'Tres concursantes': 'Three contestants',
  'Builds completas': 'Complete builds',
  'Campeones por clase': 'Champions by class',
  'Lancers aleatorios': 'Random Lancers',
  'Trío de leyendas': 'Legend trio',
  'Preferencia': 'Preference',
  'Candidatos': 'Candidates',
  'ACTIVO': 'ACTIVE',
  'TEAM-UP ELEGIDO': 'TEAM-UP SELECTED',
  'No se pudo cargar el catálogo': 'Could not load the catalog',
  'Volver a intentar': 'Try again',
  'Equipo generado correctamente': 'Team generated successfully',
  'Composición de roles generada': 'Role composition generated',
  'Cargando catálogo local…': 'Loading local catalog…',
}

const de: Dict = {
  'Preparar partida': 'Match vorbereiten', 'Configuración': 'Konfiguration', 'Ocultar': 'Ausblenden', 'Editar': 'Bearbeiten', 'Perfil': 'Profil', 'Escuadra': 'Team', 'Reglas': 'Regeln', 'Modo de perfiles': 'Profilmodus', 'Sin perfil': 'Kein Profil', 'Todos los marcados': 'Alle markierten', 'Descubrir': 'Entdecken', 'Practicar': 'Üben', 'Excluir no usados': 'Ungenutzte ausschließen', 'Favoritos': 'Favoriten', 'Solo Main': 'Nur Main',
  'Nombres, perfiles, filtros y roles': 'Namen, Profile, Filter und Rollen', 'Nombres, perfiles y grupos permitidos': 'Namen, Profile und erlaubte Gruppen', 'Nombres, perfiles y filtros': 'Namen, Profile und Filter', 'Nombres': 'Namen', 'Revolver': 'Mischen', 'Roles': 'Rollen', 'Clases': 'Klassen',
  'Ajustes de generación': 'Generierungseinstellungen', 'Ajustes exclusivos de TF2': 'TF2-spezifische Einstellungen', 'Ajustes exclusivos de PVZ GW2': 'PVZ-GW2-spezifische Einstellungen', 'Evitar repetidos': 'Duplikate vermeiden', 'Evitar clases repetidas': 'Doppelte Klassen vermeiden', 'Evitar personajes repetidos': 'Doppelte Charaktere vermeiden', 'Un héroe por equipo': 'Ein Held pro Team', 'Una clase por jugador cuando sea posible': 'Wenn möglich eine Klasse pro Spieler', 'Una variante por ficha cuando sea posible': 'Wenn möglich eine Variante pro Slot',
  'No repite personajes mientras existan alternativas válidas.': 'Vermeidet doppelte Charaktere, solange gültige Alternativen verfügbar sind.', 'Composición de roles': 'Rollenzusammenstellung', 'Distribución automática': 'Automatische Verteilung', 'Acomoda automáticamente una composición válida para el tamaño del equipo.': 'Erstellt automatisch eine gültige Zusammenstellung für die Teamgröße.', 'Perks aleatorias': 'Zufällige Perks', 'Una menor y una mayor': 'Ein kleiner und ein großer', 'Cuatro poderes Stadium': 'Vier Stadium-Kräfte', 'Modo Stadium': 'Stadium-Modus', 'Solo héroes compatibles': 'Nur kompatible Helden', 'Solo rol': 'Nur Rolle', 'Oculta los héroes': 'Blendet Helden aus',
  'Priorizar Team-Ups': 'Team-Ups priorisieren', 'Favorece sinergias, pero conserva filtros, roles y bloqueo de repetidos.': 'Bevorzugt Synergien und behält Filter, Rollen und Duplikatsperre bei.', 'Loadout completo': 'Vollständiges Loadout', 'Especialización, arma y tres artefactos únicos por ficha.': 'Spezialisierung, Waffe und drei einzigartige Gadgets pro Slot.',
  'Usar variantes': 'Varianten verwenden', 'Incluye todas las variantes del catálogo': 'Bezieht alle Katalogvarianten ein', 'Incluir personajes DLC': 'DLC-Charaktere einschließen', 'Agrega personajes especiales y desbloqueables': 'Fügt besondere und freischaltbare Charaktere hinzu', 'Permitir cambio de bando': 'Seitenwechsel erlauben', 'El botón de ficha reemplaza el resultado al instante': 'Die Karten-Schaltfläche ersetzt das Ergebnis sofort', 'Plantas disponibles': 'Verfügbare Pflanzen', 'Zombis disponibles': 'Verfügbare Zombies', 'Generar plantas': 'Pflanzen generieren', 'Generar zombis': 'Zombies generieren', 'Generar ambos': 'Beide generieren',
  'Selector principal': 'Hauptauswahl', 'Modo Mercenarios': 'Söldnermodus', 'Selector por facción': 'Fraktionsauswahl', 'Generar imagen': 'Bild erstellen', 'Generar equipo': 'Team generieren', 'Generar candidatos': 'Kandidaten generieren', 'Generando…': 'Wird generiert…', 'Preparando…': 'Wird vorbereitet…', 'Composición': 'Zusammenstellung', 'Fijados': 'Fixiert', 'Catálogo': 'Katalog', 'Formato': 'Format', 'Jugadores': 'Spieler', 'Repetidos': 'Duplikate', 'Plantas': 'Pflanzen', 'Zombis': 'Zombies', 'Sí': 'Ja', 'No': 'Nein', 'Sin selección': 'Keine Auswahl', 'Genera un equipo': 'Team generieren', 'Genera este bando': 'Diese Seite generieren', 'Equipamiento': 'Loadout', 'Poderes equipados': 'Ausgerüstete Kräfte', 'Predeterminado': 'Standard', 'VARIANTE': 'VARIANTE', 'CLASE BASE': 'BASISKLASSE', 'MENOR': 'KLEIN', 'MAYOR': 'GROSS', 'PODER': 'KRAFT', 'MERCENARIO': 'SÖLDNER',
  'Ofensiva': 'Offensive', 'Defensa': 'Verteidigung', 'Apoyo': 'Unterstützung', 'Tanque': 'Tank', 'Daño': 'Schaden', 'Superviviente': 'Überlebender', 'Luchador': 'Kämpfer', 'Táctico': 'Taktiker', 'Tirador': 'Schütze', 'Reconocimiento': 'Aufklärung', 'Flanqueador': 'Flankierer', 'Iniciador': 'Initiator', 'Especialista': 'Spezialist', 'Médico': 'Sanitäter', 'Vanguardia': 'Vorhut', 'Duelista': 'Duellant', 'Estratega': 'Stratege', 'Flexible': 'Flexibel', 'Controlador': 'Controller', 'Centinela': 'Wächter', 'Asesino': 'Assassine', 'Versátil': 'Allrounder', 'Control de área': 'Gebietskontrolle', 'Control': 'Kontrolle', 'Ofensivo': 'Offensiv', 'Ligero': 'Leicht', 'Medio': 'Mittel', 'Pesado': 'Schwer', 'Flanco': 'Flanke', 'Asalto': 'Angriff', 'Escaramuza': 'Plänkler', 'Héroe': 'Held',
  'Team-Ups y roles': 'Team-Ups und Rollen', 'Agentes por rol': 'Agenten nach Rolle', 'Tres preferencias por jugador': 'Drei Präferenzen pro Spieler', 'Tres concursantes': 'Drei Kandidaten', 'Builds completas': 'Komplette Builds', 'Campeones por clase': 'Champions nach Klasse', 'Lancers aleatorios': 'Zufällige Lancers', 'Trío de leyendas': 'Legenden-Trio', 'Preferencia': 'Präferenz', 'Candidatos': 'Kandidaten', 'ACTIVO': 'AKTIV', 'TEAM-UP ELEGIDO': 'TEAM-UP GEWÄHLT', 'No se pudo cargar el catálogo': 'Katalog konnte nicht geladen werden', 'Volver a intentar': 'Erneut versuchen', 'Equipo generado correctamente': 'Team erfolgreich generiert', 'Composición de roles generada': 'Rollenzusammenstellung generiert', 'Cargando catálogo local…': 'Lokaler Katalog wird geladen…',
}

const fr: Dict = {
  'Preparar partida': 'Préparer la partie', 'Configuración': 'Configuration', 'Ocultar': 'Masquer', 'Editar': 'Modifier', 'Perfil': 'Profil', 'Escuadra': 'Équipe', 'Reglas': 'Règles', 'Modo de perfiles': 'Mode de profils', 'Sin perfil': 'Sans profil', 'Todos los marcados': 'Tous les marqués', 'Descubrir': 'Découvrir', 'Practicar': 'S’entraîner', 'Excluir no usados': 'Exclure les inutilisés', 'Favoritos': 'Favoris', 'Solo Main': 'Main uniquement',
  'Nombres, perfiles, filtros y roles': 'Noms, profils, filtres et rôles', 'Nombres, perfiles y grupos permitidos': 'Noms, profils et groupes autorisés', 'Nombres, perfiles y filtros': 'Noms, profils et filtres', 'Nombres': 'Noms', 'Revolver': 'Mélanger', 'Roles': 'Rôles', 'Clases': 'Classes', 'Ajustes de generación': 'Paramètres de génération', 'Ajustes exclusivos de TF2': 'Paramètres propres à TF2', 'Ajustes exclusivos de PVZ GW2': 'Paramètres propres à PVZ GW2', 'Evitar repetidos': 'Éviter les doublons', 'Evitar clases repetidas': 'Éviter les classes en double', 'Evitar personajes repetidos': 'Éviter les personnages en double', 'Un héroe por equipo': 'Un héros par équipe', 'Una clase por jugador cuando sea posible': 'Une classe par joueur si possible', 'Una variante por ficha cuando sea posible': 'Une variante par emplacement si possible',
  'No repite personajes mientras existan alternativas válidas.': 'Évite les doublons tant que des alternatives valides existent.', 'Composición de roles': 'Composition des rôles', 'Distribución automática': 'Répartition automatique', 'Acomoda automáticamente una composición válida para el tamaño del equipo.': 'Crée automatiquement une composition valide selon la taille de l’équipe.', 'Perks aleatorias': 'Perks aléatoires', 'Una menor y una mayor': 'Une mineure et une majeure', 'Cuatro poderes Stadium': 'Quatre pouvoirs Stadium', 'Modo Stadium': 'Mode Stadium', 'Solo héroes compatibles': 'Héros compatibles uniquement', 'Solo rol': 'Rôle uniquement', 'Oculta los héroes': 'Masque les héros', 'Priorizar Team-Ups': 'Prioriser les Team-Ups', 'Favorece sinergias, pero conserva filtros, roles y bloqueo de repetidos.': 'Favorise les synergies tout en conservant filtres, rôles et blocage des doublons.',
  'Usar variantes': 'Utiliser les variantes', 'Incluye todas las variantes del catálogo': 'Inclut toutes les variantes du catalogue', 'Incluir personajes DLC': 'Inclure les personnages DLC', 'Agrega personajes especiales y desbloqueables': 'Ajoute les personnages spéciaux et à débloquer', 'Permitir cambio de bando': 'Autoriser le changement de camp', 'El botón de ficha reemplaza el resultado al instante': 'Le bouton de carte remplace immédiatement le résultat', 'Plantas disponibles': 'Plantes disponibles', 'Zombis disponibles': 'Zombies disponibles', 'Generar plantas': 'Générer les plantes', 'Generar zombis': 'Générer les zombies', 'Generar ambos': 'Générer les deux',
  'Selector principal': 'Sélecteur principal', 'Modo Mercenarios': 'Mode mercenaires', 'Selector por facción': 'Sélecteur par faction', 'Generar imagen': 'Générer une image', 'Generar equipo': 'Générer l’équipe', 'Generar candidatos': 'Générer les candidats', 'Generando…': 'Génération…', 'Preparando…': 'Préparation…', 'Composición': 'Composition', 'Fijados': 'Verrouillés', 'Catálogo': 'Catalogue', 'Formato': 'Format', 'Jugadores': 'Joueurs', 'Repetidos': 'Doublons', 'Plantas': 'Plantes', 'Zombis': 'Zombies', 'Sí': 'Oui', 'No': 'Non', 'Sin selección': 'Aucune sélection', 'Genera un equipo': 'Générez une équipe', 'Genera este bando': 'Générez ce camp', 'Equipamiento': 'Équipement', 'Poderes equipados': 'Pouvoirs équipés', 'Predeterminado': 'Par défaut', 'VARIANTE': 'VARIANTE', 'CLASE BASE': 'CLASSE DE BASE', 'MENOR': 'MINEURE', 'MAYOR': 'MAJEURE', 'PODER': 'POUVOIR', 'MERCENARIO': 'MERCENAIRE',
  'Ofensiva': 'Offensive', 'Defensa': 'Défense', 'Apoyo': 'Soutien', 'Tanque': 'Tank', 'Daño': 'Dégâts', 'Superviviente': 'Survivant', 'Luchador': 'Combattant', 'Táctico': 'Tacticien', 'Tirador': 'Tireur', 'Reconocimiento': 'Reconnaissance', 'Flanqueador': 'Flanqueur', 'Iniciador': 'Initiateur', 'Especialista': 'Spécialiste', 'Médico': 'Médecin', 'Vanguardia': 'Avant-garde', 'Duelista': 'Duelliste', 'Estratega': 'Stratège', 'Flexible': 'Flexible', 'Controlador': 'Contrôleur', 'Centinela': 'Sentinelle', 'Asesino': 'Assassin', 'Versátil': 'Polyvalent', 'Control de área': 'Contrôle de zone', 'Control': 'Contrôle', 'Ofensivo': 'Offensif', 'Ligero': 'Léger', 'Medio': 'Moyen', 'Pesado': 'Lourd', 'Flanco': 'Flanc', 'Asalto': 'Assaut', 'Escaramuza': 'Escarmouche', 'Héroe': 'Héros',
  'Team-Ups y roles': 'Team-Ups et rôles', 'Agentes por rol': 'Agents par rôle', 'Tres preferencias por jugador': 'Trois préférences par joueur', 'Tres concursantes': 'Trois concurrents', 'Builds completas': 'Builds complets', 'Campeones por clase': 'Champions par classe', 'Lancers aleatorios': 'Lancers aléatoires', 'Trío de leyendas': 'Trio de légendes', 'Preferencia': 'Préférence', 'Candidatos': 'Candidats', 'ACTIVO': 'ACTIF', 'TEAM-UP ELEGIDO': 'TEAM-UP CHOISI', 'No se pudo cargar el catálogo': 'Impossible de charger le catalogue', 'Volver a intentar': 'Réessayer', 'Equipo generado correctamente': 'Équipe générée avec succès', 'Composición de roles generada': 'Composition des rôles générée', 'Cargando catálogo local…': 'Chargement du catalogue local…',
}

const pt: Dict = {
  'Preparar partida': 'Preparar partida', 'Configuración': 'Configuração', 'Ocultar': 'Ocultar', 'Editar': 'Editar', 'Perfil': 'Perfil', 'Escuadra': 'Equipe', 'Reglas': 'Regras', 'Modo de perfiles': 'Modo de perfis', 'Sin perfil': 'Sem perfil', 'Todos los marcados': 'Todos marcados', 'Descubrir': 'Descobrir', 'Practicar': 'Praticar', 'Excluir no usados': 'Excluir não usados', 'Favoritos': 'Favoritos', 'Solo Main': 'Somente Main',
  'Nombres, perfiles, filtros y roles': 'Nomes, perfis, filtros e funções', 'Nombres, perfiles y grupos permitidos': 'Nomes, perfis e grupos permitidos', 'Nombres, perfiles y filtros': 'Nomes, perfis e filtros', 'Nombres': 'Nomes', 'Revolver': 'Embaralhar', 'Roles': 'Funções', 'Clases': 'Classes', 'Ajustes de generación': 'Ajustes de geração', 'Ajustes exclusivos de TF2': 'Ajustes exclusivos do TF2', 'Ajustes exclusivos de PVZ GW2': 'Ajustes exclusivos do PVZ GW2', 'Evitar repetidos': 'Evitar repetidos', 'Evitar clases repetidas': 'Evitar classes repetidas', 'Evitar personajes repetidos': 'Evitar personagens repetidos', 'Un héroe por equipo': 'Um herói por equipe', 'Una clase por jugador cuando sea posible': 'Uma classe por jogador quando possível', 'Una variante por ficha cuando sea posible': 'Uma variante por slot quando possível',
  'No repite personajes mientras existan alternativas válidas.': 'Não repete personagens enquanto houver alternativas válidas.', 'Composición de roles': 'Composição de funções', 'Distribución automática': 'Distribuição automática', 'Acomoda automáticamente una composición válida para el tamaño del equipo.': 'Monta automaticamente uma composição válida para o tamanho da equipe.', 'Perks aleatorias': 'Perks aleatórias', 'Una menor y una mayor': 'Uma menor e uma maior', 'Cuatro poderes Stadium': 'Quatro poderes Stadium', 'Modo Stadium': 'Modo Stadium', 'Solo héroes compatibles': 'Somente heróis compatíveis', 'Solo rol': 'Somente função', 'Oculta los héroes': 'Oculta os heróis', 'Priorizar Team-Ups': 'Priorizar Team-Ups', 'Favorece sinergias, pero conserva filtros, roles y bloqueo de repetidos.': 'Favorece sinergias mantendo filtros, funções e bloqueio de repetidos.',
  'Usar variantes': 'Usar variantes', 'Incluye todas las variantes del catálogo': 'Inclui todas as variantes do catálogo', 'Incluir personajes DLC': 'Incluir personagens DLC', 'Agrega personajes especiales y desbloqueables': 'Adiciona personagens especiais e desbloqueáveis', 'Permitir cambio de bando': 'Permitir troca de lado', 'El botón de ficha reemplaza el resultado al instante': 'O botão do card substitui o resultado na hora', 'Plantas disponibles': 'Plantas disponíveis', 'Zombis disponibles': 'Zumbis disponíveis', 'Generar plantas': 'Gerar plantas', 'Generar zombis': 'Gerar zumbis', 'Generar ambos': 'Gerar ambos',
  'Selector principal': 'Seletor principal', 'Modo Mercenarios': 'Modo Mercenários', 'Selector por facción': 'Seletor por facção', 'Generar imagen': 'Gerar imagem', 'Generar equipo': 'Gerar equipe', 'Generar candidatos': 'Gerar candidatos', 'Generando…': 'Gerando…', 'Preparando…': 'Preparando…', 'Composición': 'Composição', 'Fijados': 'Fixados', 'Catálogo': 'Catálogo', 'Formato': 'Formato', 'Jugadores': 'Jogadores', 'Repetidos': 'Repetidos', 'Plantas': 'Plantas', 'Zombis': 'Zumbis', 'Sí': 'Sim', 'No': 'Não', 'Sin selección': 'Sem seleção', 'Genera un equipo': 'Gere uma equipe', 'Genera este bando': 'Gere este lado', 'Equipamiento': 'Equipamento', 'Poderes equipados': 'Poderes equipados', 'Predeterminado': 'Padrão', 'VARIANTE': 'VARIANTE', 'CLASE BASE': 'CLASSE BASE', 'MENOR': 'MENOR', 'MAYOR': 'MAIOR', 'PODER': 'PODER', 'MERCENARIO': 'MERCENÁRIO',
  'Ofensiva': 'Ofensiva', 'Defensa': 'Defesa', 'Apoyo': 'Suporte', 'Tanque': 'Tanque', 'Daño': 'Dano', 'Superviviente': 'Sobrevivente', 'Luchador': 'Lutador', 'Táctico': 'Tático', 'Tirador': 'Atirador', 'Reconocimiento': 'Reconhecimento', 'Flanqueador': 'Flanqueador', 'Iniciador': 'Iniciador', 'Especialista': 'Especialista', 'Médico': 'Médico', 'Vanguardia': 'Vanguarda', 'Duelista': 'Duelista', 'Estratega': 'Estrategista', 'Flexible': 'Flexível', 'Controlador': 'Controlador', 'Centinela': 'Sentinela', 'Asesino': 'Assassino', 'Versátil': 'Versátil', 'Control de área': 'Controle de área', 'Control': 'Controle', 'Ofensivo': 'Ofensivo', 'Ligero': 'Leve', 'Medio': 'Médio', 'Pesado': 'Pesado', 'Flanco': 'Flanco', 'Asalto': 'Assalto', 'Escaramuza': 'Escaramuçador', 'Héroe': 'Herói',
  'Team-Ups y roles': 'Team-Ups e funções', 'Agentes por rol': 'Agentes por função', 'Tres preferencias por jugador': 'Três preferências por jogador', 'Tres concursantes': 'Três competidores', 'Builds completas': 'Builds completas', 'Campeones por clase': 'Campeões por classe', 'Lancers aleatorios': 'Lancers aleatórios', 'Trío de leyendas': 'Trio de lendas', 'Preferencia': 'Preferência', 'Candidatos': 'Candidatos', 'ACTIVO': 'ATIVO', 'TEAM-UP ELEGIDO': 'TEAM-UP ESCOLHIDO', 'No se pudo cargar el catálogo': 'Não foi possível carregar o catálogo', 'Volver a intentar': 'Tentar novamente', 'Equipo generado correctamente': 'Equipe gerada com sucesso', 'Composición de roles generada': 'Composição de funções gerada', 'Cargando catálogo local…': 'Carregando catálogo local…',
}

const ja: Dict = {
  'Preparar partida': 'マッチ準備', 'Configuración': '設定', 'Ocultar': '隠す', 'Editar': '編集', 'Perfil': 'プロフィール', 'Escuadra': 'チーム', 'Reglas': 'ルール', 'Modo de perfiles': 'プロフィールモード', 'Sin perfil': 'プロフィールなし', 'Todos los marcados': 'すべてのマーク済み', 'Descubrir': '発見', 'Practicar': '練習', 'Excluir no usados': '未使用を除外', 'Favoritos': 'お気に入り', 'Solo Main': 'Main のみ',
  'Nombres, perfiles, filtros y roles': '名前・プロフィール・フィルター・ロール', 'Nombres, perfiles y grupos permitidos': '名前・プロフィール・許可グループ', 'Nombres, perfiles y filtros': '名前・プロフィール・フィルター', 'Nombres': '名前', 'Revolver': 'シャッフル', 'Roles': 'ロール', 'Clases': 'クラス', 'Ajustes de generación': '生成設定', 'Ajustes exclusivos de TF2': 'TF2 専用設定', 'Ajustes exclusivos de PVZ GW2': 'PVZ GW2 専用設定', 'Evitar repetidos': '重複を避ける', 'Evitar clases repetidas': 'クラス重複を避ける', 'Evitar personajes repetidos': 'キャラクター重複を避ける', 'Un héroe por equipo': 'チーム内で同一ヒーローなし', 'Una clase por jugador cuando sea posible': '可能なら1人1クラス', 'Una variante por ficha cuando sea posible': '可能なら1枠1バリアント',
  'No repite personajes mientras existan alternativas válidas.': '有効な候補がある限りキャラクター重複を避けます。', 'Composición de roles': 'ロール構成', 'Distribución automática': '自動配分', 'Acomoda automáticamente una composición válida para el tamaño del equipo.': 'チーム人数に合う有効な構成を自動で作ります。', 'Perks aleatorias': 'ランダム Perk', 'Una menor y una mayor': 'マイナー1つ・メジャー1つ', 'Cuatro poderes Stadium': 'Stadium パワー4つ', 'Modo Stadium': 'Stadium モード', 'Solo héroes compatibles': '対応ヒーローのみ', 'Solo rol': 'ロールのみ', 'Oculta los héroes': 'ヒーローを非表示', 'Priorizar Team-Ups': 'Team-Up を優先', 'Favorece sinergias, pero conserva filtros, roles y bloqueo de repetidos.': 'シナジーを優先しつつ、フィルター・ロール・重複防止を維持します。',
  'Usar variantes': 'バリアントを使用', 'Incluye todas las variantes del catálogo': 'カタログ内の全バリアントを含める', 'Incluir personajes DLC': 'DLC キャラクターを含める', 'Agrega personajes especiales y desbloqueables': '特殊・アンロックキャラクターを追加', 'Permitir cambio de bando': '陣営変更を許可', 'El botón de ficha reemplaza el resultado al instante': 'カードのボタンで結果を即座に置き換えます', 'Plantas disponibles': '使用可能なプラント', 'Zombis disponibles': '使用可能なゾンビ', 'Generar plantas': 'プラントを生成', 'Generar zombis': 'ゾンビを生成', 'Generar ambos': '両方生成',
  'Selector principal': 'メイン選択', 'Modo Mercenarios': 'マーセナリーモード', 'Selector por facción': '陣営別選択', 'Generar imagen': '画像を生成', 'Generar equipo': 'チームを生成', 'Generar candidatos': '候補を生成', 'Generando…': '生成中…', 'Preparando…': '準備中…', 'Composición': '構成', 'Fijados': '固定', 'Catálogo': 'カタログ', 'Formato': '形式', 'Jugadores': 'プレイヤー', 'Repetidos': '重複', 'Plantas': 'プラント', 'Zombis': 'ゾンビ', 'Sí': 'はい', 'No': 'いいえ', 'Sin selección': '未選択', 'Genera un equipo': 'チームを生成', 'Genera este bando': 'この陣営を生成', 'Equipamiento': '装備', 'Poderes equipados': '装備中のパワー', 'Predeterminado': 'デフォルト', 'VARIANTE': 'バリアント', 'CLASE BASE': '基本クラス', 'MENOR': 'マイナー', 'MAYOR': 'メジャー', 'PODER': 'パワー', 'MERCENARIO': 'マーセナリー',
  'Ofensiva': '攻撃', 'Defensa': '防御', 'Apoyo': 'サポート', 'Tanque': 'タンク', 'Daño': 'ダメージ', 'Superviviente': 'サバイバー', 'Luchador': 'ファイター', 'Táctico': 'タクティシャン', 'Tirador': 'マークスマン', 'Reconocimiento': '偵察', 'Flanqueador': 'フランカー', 'Iniciador': 'イニシエーター', 'Especialista': 'スペシャリスト', 'Médico': 'メディック', 'Vanguardia': 'ヴァンガード', 'Duelista': 'デュエリスト', 'Estratega': 'ストラテジスト', 'Flexible': 'フレックス', 'Controlador': 'コントローラー', 'Centinela': 'センチネル', 'Asesino': 'アサシン', 'Versátil': 'オールラウンダー', 'Control de área': 'エリア制御', 'Control': 'コントロール', 'Ofensivo': 'オフェンス', 'Ligero': 'ライト', 'Medio': 'ミディアム', 'Pesado': 'ヘビー', 'Flanco': 'フランク', 'Asalto': 'アサルト', 'Escaramuza': 'スカーミッシャー', 'Héroe': 'ヒーロー',
  'Team-Ups y roles': 'Team-Up とロール', 'Agentes por rol': 'ロール別エージェント', 'Tres preferencias por jugador': 'プレイヤーごとに3候補', 'Tres concursantes': '3人の出場者', 'Builds completas': '完全ビルド', 'Campeones por clase': 'クラス別チャンピオン', 'Lancers aleatorios': 'ランダム Lancer', 'Trío de leyendas': 'レジェンド3人組', 'Preferencia': '候補', 'Candidatos': '候補', 'ACTIVO': '有効', 'TEAM-UP ELEGIDO': '選択済み TEAM-UP', 'No se pudo cargar el catálogo': 'カタログを読み込めませんでした', 'Volver a intentar': '再試行', 'Equipo generado correctamente': 'チームを生成しました', 'Composición de roles generada': 'ロール構成を生成しました', 'Cargando catálogo local…': 'ローカルカタログを読み込み中…',
}

const ko: Dict = {
  'Preparar partida': '매치 준비', 'Configuración': '설정', 'Ocultar': '숨기기', 'Editar': '편집', 'Perfil': '프로필', 'Escuadra': '스쿼드', 'Reglas': '규칙', 'Modo de perfiles': '프로필 모드', 'Sin perfil': '프로필 없음', 'Todos los marcados': '표시된 항목 모두', 'Descubrir': '발견', 'Practicar': '연습', 'Excluir no usados': '미사용 제외', 'Favoritos': '즐겨찾기', 'Solo Main': 'Main만',
  'Nombres, perfiles, filtros y roles': '이름, 프로필, 필터 및 역할', 'Nombres, perfiles y grupos permitidos': '이름, 프로필 및 허용 그룹', 'Nombres, perfiles y filtros': '이름, 프로필 및 필터', 'Nombres': '이름', 'Revolver': '섞기', 'Roles': '역할', 'Clases': '클래스', 'Ajustes de generación': '생성 설정', 'Ajustes exclusivos de TF2': 'TF2 전용 설정', 'Ajustes exclusivos de PVZ GW2': 'PVZ GW2 전용 설정', 'Evitar repetidos': '중복 방지', 'Evitar clases repetidas': '클래스 중복 방지', 'Evitar personajes repetidos': '캐릭터 중복 방지', 'Un héroe por equipo': '팀당 영웅 1명', 'Una clase por jugador cuando sea posible': '가능하면 플레이어당 클래스 1개', 'Una variante por ficha cuando sea posible': '가능하면 슬롯당 변형 1개',
  'No repite personajes mientras existan alternativas válidas.': '유효한 대안이 있는 동안 캐릭터 중복을 피합니다.', 'Composición de roles': '역할 구성', 'Distribución automática': '자동 배분', 'Acomoda automáticamente una composición válida para el tamaño del equipo.': '팀 규모에 맞는 유효한 구성을 자동으로 만듭니다.', 'Perks aleatorias': '무작위 Perk', 'Una menor y una mayor': '마이너 1개와 메이저 1개', 'Cuatro poderes Stadium': 'Stadium 파워 4개', 'Modo Stadium': 'Stadium 모드', 'Solo héroes compatibles': '호환 영웅만', 'Solo rol': '역할만', 'Oculta los héroes': '영웅 숨기기', 'Priorizar Team-Ups': 'Team-Up 우선', 'Favorece sinergias, pero conserva filtros, roles y bloqueo de repetidos.': '시너지를 우선하면서 필터, 역할, 중복 방지를 유지합니다.',
  'Usar variantes': '변형 사용', 'Incluye todas las variantes del catálogo': '카탈로그의 모든 변형 포함', 'Incluir personajes DLC': 'DLC 캐릭터 포함', 'Agrega personajes especiales y desbloqueables': '특수 및 해금 캐릭터 추가', 'Permitir cambio de bando': '진영 변경 허용', 'El botón de ficha reemplaza el resultado al instante': '카드 버튼으로 결과를 즉시 교체합니다', 'Plantas disponibles': '사용 가능한 식물', 'Zombis disponibles': '사용 가능한 좀비', 'Generar plantas': '식물 생성', 'Generar zombis': '좀비 생성', 'Generar ambos': '둘 다 생성',
  'Selector principal': '메인 선택기', 'Modo Mercenarios': '용병 모드', 'Selector por facción': '진영 선택기', 'Generar imagen': '이미지 생성', 'Generar equipo': '팀 생성', 'Generar candidatos': '후보 생성', 'Generando…': '생성 중…', 'Preparando…': '준비 중…', 'Composición': '구성', 'Fijados': '고정', 'Catálogo': '카탈로그', 'Formato': '형식', 'Jugadores': '플레이어', 'Repetidos': '중복', 'Plantas': '식물', 'Zombis': '좀비', 'Sí': '예', 'No': '아니요', 'Sin selección': '선택 없음', 'Genera un equipo': '팀을 생성하세요', 'Genera este bando': '이 진영 생성', 'Equipamiento': '장비', 'Poderes equipados': '장착 파워', 'Predeterminado': '기본값', 'VARIANTE': '변형', 'CLASE BASE': '기본 클래스', 'MENOR': '마이너', 'MAYOR': '메이저', 'PODER': '파워', 'MERCENARIO': '용병',
  'Ofensiva': '공격', 'Defensa': '방어', 'Apoyo': '지원', 'Tanque': '탱커', 'Daño': '공격', 'Superviviente': '생존자', 'Luchador': '격투가', 'Táctico': '전술가', 'Tirador': '사수', 'Reconocimiento': '정찰', 'Flanqueador': '플랭커', 'Iniciador': '개시자', 'Especialista': '전문가', 'Médico': '메딕', 'Vanguardia': '뱅가드', 'Duelista': '듀얼리스트', 'Estratega': '전략가', 'Flexible': '플렉스', 'Controlador': '컨트롤러', 'Centinela': '센티널', 'Asesino': '암살자', 'Versátil': '올라운더', 'Control de área': '지역 제어', 'Control': '제어', 'Ofensivo': '공격형', 'Ligero': '라이트', 'Medio': '미디엄', 'Pesado': '헤비', 'Flanco': '플랭크', 'Asalto': '어설트', 'Escaramuza': '스커미셔', 'Héroe': '영웅',
  'Team-Ups y roles': 'Team-Up 및 역할', 'Agentes por rol': '역할별 요원', 'Tres preferencias por jugador': '플레이어당 후보 3명', 'Tres concursantes': '참가자 3명', 'Builds completas': '완성 빌드', 'Campeones por clase': '클래스별 챔피언', 'Lancers aleatorios': '무작위 Lancer', 'Trío de leyendas': '레전드 트리오', 'Preferencia': '선호', 'Candidatos': '후보', 'ACTIVO': '활성', 'TEAM-UP ELEGIDO': '선택된 TEAM-UP', 'No se pudo cargar el catálogo': '카탈로그를 불러오지 못했습니다', 'Volver a intentar': '다시 시도', 'Equipo generado correctamente': '팀 생성 완료', 'Composición de roles generada': '역할 구성 생성 완료', 'Cargando catálogo local…': '로컬 카탈로그 불러오는 중…',
}

const zh: Dict = {
  'Preparar partida': '准备对局', 'Configuración': '设置', 'Ocultar': '隐藏', 'Editar': '编辑', 'Perfil': '配置档', 'Escuadra': '队伍', 'Reglas': '规则', 'Modo de perfiles': '配置档模式', 'Sin perfil': '无配置档', 'Todos los marcados': '所有已标记', 'Descubrir': '探索', 'Practicar': '练习', 'Excluir no usados': '排除未使用', 'Favoritos': '收藏', 'Solo Main': '仅 Main',
  'Nombres, perfiles, filtros y roles': '名称、配置档、筛选和职责', 'Nombres, perfiles y grupos permitidos': '名称、配置档和允许的组', 'Nombres, perfiles y filtros': '名称、配置档和筛选', 'Nombres': '名称', 'Revolver': '打乱', 'Roles': '职责', 'Clases': '职业', 'Ajustes de generación': '生成设置', 'Ajustes exclusivos de TF2': 'TF2 专用设置', 'Ajustes exclusivos de PVZ GW2': 'PVZ GW2 专用设置', 'Evitar repetidos': '避免重复', 'Evitar clases repetidas': '避免职业重复', 'Evitar personajes repetidos': '避免角色重复', 'Un héroe por equipo': '队伍内英雄不重复', 'Una clase por jugador cuando sea posible': '尽量每位玩家一个职业', 'Una variante por ficha cuando sea posible': '尽量每个位置一个变体',
  'No repite personajes mientras existan alternativas válidas.': '存在有效替代时不重复角色。', 'Composición de roles': '职责构成', 'Distribución automática': '自动分配', 'Acomoda automáticamente una composición válida para el tamaño del equipo.': '根据队伍人数自动生成有效构成。', 'Perks aleatorias': '随机 Perk', 'Una menor y una mayor': '一个小型和一个大型', 'Cuatro poderes Stadium': '四个 Stadium 能力', 'Modo Stadium': 'Stadium 模式', 'Solo héroes compatibles': '仅兼容英雄', 'Solo rol': '仅职责', 'Oculta los héroes': '隐藏英雄', 'Priorizar Team-Ups': '优先 Team-Up', 'Favorece sinergias, pero conserva filtros, roles y bloqueo de repetidos.': '优先协同，同时保留筛选、职责和防重复设置。',
  'Usar variantes': '使用变体', 'Incluye todas las variantes del catálogo': '包含目录中的所有变体', 'Incluir personajes DLC': '包含 DLC 角色', 'Agrega personajes especiales y desbloqueables': '加入特殊和可解锁角色', 'Permitir cambio de bando': '允许切换阵营', 'El botón de ficha reemplaza el resultado al instante': '卡片按钮会立即替换结果', 'Plantas disponibles': '可用植物', 'Zombis disponibles': '可用僵尸', 'Generar plantas': '生成植物', 'Generar zombis': '生成僵尸', 'Generar ambos': '全部生成',
  'Selector principal': '主选择器', 'Modo Mercenarios': '佣兵模式', 'Selector por facción': '阵营选择器', 'Generar imagen': '生成图片', 'Generar equipo': '生成队伍', 'Generar candidatos': '生成候选', 'Generando…': '生成中…', 'Preparando…': '准备中…', 'Composición': '构成', 'Fijados': '已锁定', 'Catálogo': '目录', 'Formato': '格式', 'Jugadores': '玩家', 'Repetidos': '重复', 'Plantas': '植物', 'Zombis': '僵尸', 'Sí': '是', 'No': '否', 'Sin selección': '未选择', 'Genera un equipo': '生成队伍', 'Genera este bando': '生成该阵营', 'Equipamiento': '装备', 'Poderes equipados': '已装备能力', 'Predeterminado': '默认', 'VARIANTE': '变体', 'CLASE BASE': '基础职业', 'MENOR': '小型', 'MAYOR': '大型', 'PODER': '能力', 'MERCENARIO': '佣兵',
  'Ofensiva': '进攻', 'Defensa': '防御', 'Apoyo': '支援', 'Tanque': '坦克', 'Daño': '输出', 'Superviviente': '生存者', 'Luchador': '斗士', 'Táctico': '战术', 'Tirador': '射手', 'Reconocimiento': '侦察', 'Flanqueador': '侧翼', 'Iniciador': '先手', 'Especialista': '专家', 'Médico': '医疗', 'Vanguardia': '先锋', 'Duelista': '决斗者', 'Estratega': '策略家', 'Flexible': '灵活', 'Controlador': '控场', 'Centinela': '哨卫', 'Asesino': '刺客', 'Versátil': '全能', 'Control de área': '区域控制', 'Control': '控制', 'Ofensivo': '进攻型', 'Ligero': '轻型', 'Medio': '中型', 'Pesado': '重型', 'Flanco': '侧翼', 'Asalto': '突击', 'Escaramuza': '游击', 'Héroe': '英雄',
  'Team-Ups y roles': 'Team-Up 与职责', 'Agentes por rol': '按职责分配特工', 'Tres preferencias por jugador': '每位玩家三个候选', 'Tres concursantes': '三名选手', 'Builds completas': '完整 Build', 'Campeones por clase': '按职业分配英雄', 'Lancers aleatorios': '随机 Lancer', 'Trío de leyendas': '传奇三人组', 'Preferencia': '候选', 'Candidatos': '候选', 'ACTIVO': '已激活', 'TEAM-UP ELEGIDO': '已选择 TEAM-UP', 'No se pudo cargar el catálogo': '无法加载目录', 'Volver a intentar': '重试', 'Equipo generado correctamente': '队伍生成成功', 'Composición de roles generada': '职责构成已生成', 'Cargando catálogo local…': '正在加载本地目录…',
}

const dictionaries: Partial<Record<SupportedLocale, Dict>> = {
  'en-us': en,
  'de-de': de,
  'fr-fr': fr,
  'pt-br': pt,
  'ja-jp': ja,
  'ko-kr': ko,
  'zh-cn': zh,
}



const supplemental: Partial<Record<SupportedLocale, Dict>> = {
  'en-us': {
    'Loadout completo': 'Full loadout', 'Especialización, arma y tres artefactos únicos por ficha.': 'Specialization, weapon and three unique gadgets per slot.',
    'Mercenarios': 'Mercenaries', 'Selección': 'Selection', 'Pendiente': 'Pending', 'Catálogo oficial TF2': 'Official TF2 catalog', 'Sin perfil asignado': 'No profile assigned', 'Planta': 'Plant', 'Zombi': 'Zombie',

    'Reuniendo…': 'Assembling…',
    '121 personajes y variantes listos': '121 characters and variants ready',
    'Orden de jugadores mezclado': 'Player order shuffled',
  },
  'de-de': {
    'Loadout completo': 'Vollständiges Loadout', 'Especialización, arma y tres artefactos únicos por ficha.': 'Spezialisierung, Waffe und drei einzigartige Gadgets pro Slot.',
    'Mercenarios': 'Söldner', 'Selección': 'Auswahl', 'Pendiente': 'Ausstehend', 'Catálogo oficial TF2': 'Offizieller TF2-Katalog', 'Sin perfil asignado': 'Kein Profil zugewiesen', 'Planta': 'Pflanze', 'Zombi': 'Zombie',

    'Reuniendo…': 'Wird zusammengestellt…',
    '121 personajes y variantes listos': '121 Charaktere und Varianten bereit',
    'Orden de jugadores mezclado': 'Spielerreihenfolge gemischt',
    'Ignora los perfiles. Usa cualquier héroe permitido por roles y filtros.': 'Ignoriert Profile. Verwendet jeden durch Rollen und Filter erlaubten Helden.',
    'Elige por igual entre Main, Usado, Jugado y No usado.': 'Wählt gleichmäßig zwischen Main, Benutzt, Gespielt und Ungenutzt.',
    'Da más oportunidad a héroes menos familiares para crear variedad.': 'Gibt weniger vertrauten Helden eine höhere Chance für mehr Abwechslung.',
    'Usa héroes marcados como Jugado o No usado.': 'Verwendet Helden, die als Gespielt oder Ungenutzt markiert sind.',
    'Usa Main, Usado o Jugado y evita los marcados como No usado.': 'Verwendet Main, Benutzt oder Gespielt und meidet Ungenutzt.',
    'Usa solamente héroes Main y Usado.': 'Verwendet nur Main- und Benutzt-Helden.',
    'Busca héroes Main y vuelve al catálogo permitido si el rol no tiene ninguno.': 'Sucht Main-Helden und greift auf den erlaubten Katalog zurück, wenn eine Rolle keine hat.',
  },
  'fr-fr': {
    'Loadout completo': 'Équipement complet', 'Especialización, arma y tres artefactos únicos por ficha.': 'Spécialisation, arme et trois gadgets uniques par emplacement.',
    'Mercenarios': 'Mercenaires', 'Selección': 'Sélection', 'Pendiente': 'En attente', 'Catálogo oficial TF2': 'Catalogue officiel TF2', 'Sin perfil asignado': 'Aucun profil attribué', 'Planta': 'Plante', 'Zombi': 'Zombie',

    'Reuniendo…': 'Assemblage…',
    '121 personajes y variantes listos': '121 personnages et variantes prêts',
    'Orden de jugadores mezclado': 'Ordre des joueurs mélangé',
    'Ignora los perfiles. Usa cualquier héroe permitido por roles y filtros.': 'Ignore les profils et utilise tout héros autorisé par les rôles et filtres.',
    'Elige por igual entre Main, Usado, Jugado y No usado.': 'Choisit équitablement entre Main, Utilisé, Joué et Non utilisé.',
    'Da más oportunidad a héroes menos familiares para crear variedad.': 'Donne plus de chances aux héros moins familiers pour plus de variété.',
    'Usa héroes marcados como Jugado o No usado.': 'Utilise les héros marqués Joué ou Non utilisé.',
    'Usa Main, Usado o Jugado y evita los marcados como No usado.': 'Utilise Main, Utilisé ou Joué et évite Non utilisé.',
    'Usa solamente héroes Main y Usado.': 'Utilise uniquement les héros Main et Utilisé.',
    'Busca héroes Main y vuelve al catálogo permitido si el rol no tiene ninguno.': 'Cherche les héros Main et revient au catalogue autorisé si un rôle n’en a aucun.',
  },
  'pt-br': {
    'Loadout completo': 'Loadout completo', 'Especialización, arma y tres artefactos únicos por ficha.': 'Especialização, arma e três gadgets únicos por slot.',
    'Mercenarios': 'Mercenários', 'Selección': 'Seleção', 'Pendiente': 'Pendente', 'Catálogo oficial TF2': 'Catálogo oficial do TF2', 'Sin perfil asignado': 'Sem perfil atribuído', 'Planta': 'Planta', 'Zombi': 'Zumbi',

    'Reuniendo…': 'Montando…',
    '121 personajes y variantes listos': '121 personagens e variantes prontos',
    'Orden de jugadores mezclado': 'Ordem dos jogadores embaralhada',
    'Ignora los perfiles. Usa cualquier héroe permitido por roles y filtros.': 'Ignora os perfis e usa qualquer herói permitido por funções e filtros.',
    'Elige por igual entre Main, Usado, Jugado y No usado.': 'Escolhe igualmente entre Main, Usado, Jogado e Não usado.',
    'Da más oportunidad a héroes menos familiares para crear variedad.': 'Dá mais chance a heróis menos familiares para criar variedade.',
    'Usa héroes marcados como Jugado o No usado.': 'Usa heróis marcados como Jogado ou Não usado.',
    'Usa Main, Usado o Jugado y evita los marcados como No usado.': 'Usa Main, Usado ou Jogado e evita os marcados como Não usado.',
    'Usa solamente héroes Main y Usado.': 'Usa somente heróis Main e Usado.',
    'Busca héroes Main y vuelve al catálogo permitido si el rol no tiene ninguno.': 'Procura heróis Main e volta ao catálogo permitido se a função não tiver nenhum.',
  },
  'ja-jp': {
    'Loadout completo': '完全ロードアウト', 'Especialización, arma y tres artefactos únicos por ficha.': '各枠に専門能力・武器・3つの固有ガジェット。',
    'Mercenarios': 'マーセナリー', 'Selección': '選択', 'Pendiente': '保留', 'Catálogo oficial TF2': 'TF2 公式カタログ', 'Sin perfil asignado': 'プロフィール未設定', 'Planta': 'プラント', 'Zombi': 'ゾンビ',

    'Reuniendo…': '編成中…',
    '121 personajes y variantes listos': '121 キャラクターとバリアント準備完了',
    'Orden de jugadores mezclado': 'プレイヤー順をシャッフルしました',
    'Ignora los perfiles. Usa cualquier héroe permitido por roles y filtros.': 'プロフィールを無視し、ロールとフィルターで許可されたヒーローを使用します。',
    'Elige por igual entre Main, Usado, Jugado y No usado.': 'Main・使用済み・プレイ済み・未使用から均等に選びます。',
    'Da más oportunidad a héroes menos familiares para crear variedad.': '慣れていないヒーローの確率を上げて変化を増やします。',
    'Usa héroes marcados como Jugado o No usado.': 'プレイ済みまたは未使用のヒーローを使用します。',
    'Usa Main, Usado o Jugado y evita los marcados como No usado.': 'Main・使用済み・プレイ済みを使い、未使用を避けます。',
    'Usa solamente héroes Main y Usado.': 'Main と使用済みのヒーローだけを使用します。',
    'Busca héroes Main y vuelve al catálogo permitido si el rol no tiene ninguno.': 'Main ヒーローを優先し、該当ロールにいなければ許可カタログへ戻ります。',
  },
  'ko-kr': {
    'Loadout completo': '전체 로드아웃', 'Especialización, arma y tres artefactos únicos por ficha.': '슬롯마다 전문화, 무기, 고유 가젯 3개.',
    'Mercenarios': '용병', 'Selección': '선택', 'Pendiente': '대기', 'Catálogo oficial TF2': 'TF2 공식 카탈로그', 'Sin perfil asignado': '프로필 미지정', 'Planta': '식물', 'Zombi': '좀비',

    'Reuniendo…': '팀 구성 중…',
    '121 personajes y variantes listos': '121개 캐릭터와 변형 준비 완료',
    'Orden de jugadores mezclado': '플레이어 순서 섞음',
    'Ignora los perfiles. Usa cualquier héroe permitido por roles y filtros.': '프로필을 무시하고 역할과 필터에서 허용된 영웅을 사용합니다.',
    'Elige por igual entre Main, Usado, Jugado y No usado.': 'Main, 사용, 플레이, 미사용에서 균등하게 선택합니다.',
    'Da más oportunidad a héroes menos familiares para crear variedad.': '덜 익숙한 영웅의 확률을 높여 다양성을 만듭니다.',
    'Usa héroes marcados como Jugado o No usado.': '플레이 또는 미사용으로 표시된 영웅을 사용합니다.',
    'Usa Main, Usado o Jugado y evita los marcados como No usado.': 'Main, 사용 또는 플레이를 쓰고 미사용은 피합니다.',
    'Usa solamente héroes Main y Usado.': 'Main과 사용 영웅만 사용합니다.',
    'Busca héroes Main y vuelve al catálogo permitido si el rol no tiene ninguno.': 'Main 영웅을 찾고 해당 역할에 없으면 허용 카탈로그로 돌아갑니다.',
  },
  'zh-cn': {
    'Loadout completo': '完整装备', 'Especialización, arma y tres artefactos únicos por ficha.': '每个位置包含专精、武器和三个独特道具。',
    'Mercenarios': '佣兵', 'Selección': '选择', 'Pendiente': '待定', 'Catálogo oficial TF2': 'TF2 官方目录', 'Sin perfil asignado': '未分配配置档', 'Planta': '植物', 'Zombi': '僵尸',

    'Reuniendo…': '正在组队…',
    '121 personajes y variantes listos': '121 个角色及变体已就绪',
    'Orden de jugadores mezclado': '玩家顺序已打乱',
    'Ignora los perfiles. Usa cualquier héroe permitido por roles y filtros.': '忽略配置档，使用职责和筛选允许的任意英雄。',
    'Elige por igual entre Main, Usado, Jugado y No usado.': '在 Main、已使用、已玩和未使用之间均等选择。',
    'Da más oportunidad a héroes menos familiares para crear variedad.': '提高不熟悉英雄的概率以增加变化。',
    'Usa héroes marcados como Jugado o No usado.': '使用标记为已玩或未使用的英雄。',
    'Usa Main, Usado o Jugado y evita los marcados como No usado.': '使用 Main、已使用或已玩，并避开未使用。',
    'Usa solamente héroes Main y Usado.': '仅使用 Main 和已使用英雄。',
    'Busca héroes Main y vuelve al catálogo permitido si el rol no tiene ninguno.': '优先寻找 Main 英雄；若该职责没有，则回到允许目录。',
  },
}

const knownSources = new Set<string>([
  ...Object.keys(en), ...Object.keys(de), ...Object.keys(fr), ...Object.keys(pt), ...Object.keys(ja), ...Object.keys(ko), ...Object.keys(zh),
  ...Object.values(supplemental).flatMap((dict) => Object.keys(dict ?? {})),
])
const knownSourcesLower = new Set([...knownSources].map((value) => value.toLocaleLowerCase('es')))

function isUiSource(value: string): boolean {
  const core = value.trim()
  if (knownSourcesLower.has(core.toLocaleLowerCase('es'))) return true
  return [
    /^Jugador\s+\d+$/i,
    /^\d+\s+jugadores?$/i,
    /^\d+\s+mejoras seleccionadas$/i,
    /^\d+\s+poderes seleccionados$/i,
    /^\d+\s+(héroes|clases|personajes|agentes|campeones|concursantes|complexiones|leyendas)$/i,
    /^Preferencia\s+\d+$/i,
    /^Ajustes exclusivos de\s+.+$/i,
    /^\d+ héroes listos(?: · .+)?$/i,
    /^\d+\/\d+ selecciones · \d+ Team-Up activos?$/i,
    /^\d+ fichas · \d+ candidatos generados$/i,
    /^(PODER)\s+\d+$/i,
    /^\d+\/3 opciones para matchmaking$/i,
    /^\d+ elementos equipados$/i,
    /^Con\s+.+$/i,
    /^Potencia a\s+.+$/i,
    /^Base · mejora con\s+.+$/i,
    /^Cargando\s+.+…$/i,
    /^\d+\/\d+ selecciones generadas$/i,
    /^\d+\s+(héroes|clases|personajes|agentes|campeones|concursantes|complexiones|leyendas)\s+listos$/i,
    /^.+\s+activo$/i,
    /^(Ligero|Medio|Pesado|Tanque|Daño|Apoyo|Vanguardia|Duelista|Estratega|Flexible)\s*·\s*.+$/i,
  ].some((pattern) => pattern.test(core))
}

const sourceText = new WeakMap<Text, string>()
const localizedText = new WeakMap<Text, string>()

function playerWord(locale: SupportedLocale, count: number): string {
  switch (locale) {
    case 'en-us': return count === 1 ? 'player' : 'players'
    case 'de-de': return count === 1 ? 'Spieler' : 'Spieler'
    case 'fr-fr': return count === 1 ? 'joueur' : 'joueurs'
    case 'pt-br': return count === 1 ? 'jogador' : 'jogadores'
    case 'ja-jp': return 'プレイヤー'
    case 'ko-kr': return '플레이어'
    case 'zh-cn': return '名玩家'
    default: return count === 1 ? 'jugador' : 'jugadores'
  }
}

export function localizedPlayerName(locale: SupportedLocale, index: number): string {
  switch (locale) {
    case 'en-us': return `Player ${index}`
    case 'de-de': return `Spieler ${index}`
    case 'fr-fr': return `Joueur ${index}`
    case 'pt-br': return `Jogador ${index}`
    case 'ja-jp': return `プレイヤー ${index}`
    case 'ko-kr': return `플레이어 ${index}`
    case 'zh-cn': return `玩家 ${index}`
    default: return `Jugador ${index}`
  }
}

export function isDefaultPlayerName(value: string, index: number): boolean {
  const normalized = value.trim()
  return [
    `Jugador ${index}`, `Player ${index}`, `Spieler ${index}`, `Joueur ${index}`, `Jogador ${index}`,
    `プレイヤー ${index}`, `플레이어 ${index}`, `玩家 ${index}`,
  ].includes(normalized)
}

export function translateUiText(locale: SupportedLocale, value: string): string {
  if (locale === 'es-mx' || locale === 'es-es') return value
  const leading = value.match(/^\s*/)?.[0] ?? ''
  const trailing = value.match(/\s*$/)?.[0] ?? ''
  const core = value.trim()
  if (!core) return value
  const dict = dictionaries[locale]
  if (!dict) return value

  const combined = { ...dict, ...(supplemental[locale] ?? {}) }
  const exactKey = Object.keys(combined).find((key) => key.toLocaleLowerCase('es') === core.toLocaleLowerCase('es'))
  const exact = exactKey ? combined[exactKey] : undefined
  if (exact) {
    const allUpper = core === core.toLocaleUpperCase('es') && core !== core.toLocaleLowerCase('es')
    const translated = allUpper ? exact.toLocaleUpperCase(locale) : exact
    return `${leading}${translated}${trailing}`
  }

  const player = core.match(/^Jugador\s+(\d+)$/i)
  if (player) return `${leading}${localizedPlayerName(locale, Number(player[1]))}${trailing}`

  const players = core.match(/^(\d+)\s+jugadores?$/i)
  if (players) {
    const count = Number(players[1])
    if (locale === 'ja-jp' || locale === 'ko-kr') return `${leading}${count} ${playerWord(locale, count)}${trailing}`
    if (locale === 'zh-cn') return `${leading}${count}${playerWord(locale, count)}${trailing}`
    return `${leading}${count} ${playerWord(locale, count)}${trailing}`
  }

  const improvements = core.match(/^(\d+)\s+mejoras seleccionadas$/i)
  if (improvements) {
    const n = improvements[1]
    const map: Partial<Record<SupportedLocale, string>> = {
      'en-us': `${n} upgrades selected`, 'de-de': `${n} Verbesserungen ausgewählt`, 'fr-fr': `${n} améliorations sélectionnées`, 'pt-br': `${n} melhorias selecionadas`, 'ja-jp': `${n} 個の強化を選択`, 'ko-kr': `${n}개 강화 선택됨`, 'zh-cn': `已选择 ${n} 项强化`,
    }
    return `${leading}${map[locale] ?? core}${trailing}`
  }

  const powers = core.match(/^(\d+)\s+poderes seleccionados$/i)
  if (powers) {
    const n = powers[1]
    const map: Partial<Record<SupportedLocale, string>> = {
      'en-us': `${n} powers selected`, 'de-de': `${n} Kräfte ausgewählt`, 'fr-fr': `${n} pouvoirs sélectionnés`, 'pt-br': `${n} poderes selecionados`, 'ja-jp': `${n} 個のパワーを選択`, 'ko-kr': `${n}개 파워 선택됨`, 'zh-cn': `已选择 ${n} 个能力`,
    }
    return `${leading}${map[locale] ?? core}${trailing}`
  }

  const catalog = core.match(/^(\d+)\s+(héroes|clases|personajes|agentes|campeones|concursantes|complexiones|leyendas)$/i)
  if (catalog) {
    const n = catalog[1]
    const noun = catalog[2].toLowerCase()
    const nouns: Record<string, Partial<Record<SupportedLocale, string>>> = {
      'héroes': { 'en-us': 'heroes', 'de-de': 'Helden', 'fr-fr': 'héros', 'pt-br': 'heróis', 'ja-jp': 'ヒーロー', 'ko-kr': '영웅', 'zh-cn': '名英雄' },
      'clases': { 'en-us': 'classes', 'de-de': 'Klassen', 'fr-fr': 'classes', 'pt-br': 'classes', 'ja-jp': 'クラス', 'ko-kr': '클래스', 'zh-cn': '个职业' },
      'personajes': { 'en-us': 'characters', 'de-de': 'Charaktere', 'fr-fr': 'personnages', 'pt-br': 'personagens', 'ja-jp': 'キャラクター', 'ko-kr': '캐릭터', 'zh-cn': '个角色' },
      'agentes': { 'en-us': 'agents', 'de-de': 'Agenten', 'fr-fr': 'agents', 'pt-br': 'agentes', 'ja-jp': 'エージェント', 'ko-kr': '요원', 'zh-cn': '名特工' },
      'campeones': { 'en-us': 'champions', 'de-de': 'Champions', 'fr-fr': 'champions', 'pt-br': 'campeões', 'ja-jp': 'チャンピオン', 'ko-kr': '챔피언', 'zh-cn': '名英雄' },
      'concursantes': { 'en-us': 'contestants', 'de-de': 'Teilnehmer', 'fr-fr': 'concurrents', 'pt-br': 'competidores', 'ja-jp': '出場者', 'ko-kr': '참가자', 'zh-cn': '名选手' },
      'complexiones': { 'en-us': 'builds', 'de-de': 'Körperklassen', 'fr-fr': 'gabarits', 'pt-br': 'biotipos', 'ja-jp': '体格', 'ko-kr': '체형', 'zh-cn': '种体型' },
      'leyendas': { 'en-us': 'legends', 'de-de': 'Legenden', 'fr-fr': 'légendes', 'pt-br': 'lendas', 'ja-jp': 'レジェンド', 'ko-kr': '레전드', 'zh-cn': '名传奇' },
    }
    const translatedNoun = nouns[noun]?.[locale]
    if (translatedNoun) return `${leading}${locale === 'zh-cn' ? `${n}${translatedNoun}` : `${n} ${translatedNoun}`}${trailing}`
  }

  const preference = core.match(/^Preferencia\s+(\d+)$/i)
  if (preference) return `${leading}${dict['Preferencia'] ?? 'Preferencia'} ${preference[1]}${trailing}`

  const exclusive = core.match(/^Ajustes exclusivos de\s+(.+)$/i)
  if (exclusive) {
    const game = exclusive[1]
    const map: Partial<Record<SupportedLocale, string>> = {
      'en-us': `${game}-specific settings`, 'de-de': `${game}-spezifische Einstellungen`, 'fr-fr': `Paramètres propres à ${game}`, 'pt-br': `Ajustes exclusivos de ${game}`, 'ja-jp': `${game} 専用設定`, 'ko-kr': `${game} 전용 설정`, 'zh-cn': `${game} 专用设置`,
    }
    return `${leading}${map[locale] ?? core}${trailing}`
  }

  const readyHeroes = core.match(/^([0-9]+) héroes listos(?: · (.+))?$/i)
  if (readyHeroes) {
    const n = readyHeroes[1]
    const suffix = readyHeroes[2] ? ` · ${readyHeroes[2]}` : ''
    const map: Partial<Record<SupportedLocale, string>> = { 'en-us': `${n} heroes ready${suffix}`, 'de-de': `${n} Helden bereit${suffix}`, 'fr-fr': `${n} héros prêts${suffix}`, 'pt-br': `${n} heróis prontos${suffix}`, 'ja-jp': `${n} ヒーロー準備完了${suffix}`, 'ko-kr': `${n}명 영웅 준비 완료${suffix}`, 'zh-cn': `${n} 名英雄已就绪${suffix}` }
    return `${leading}${map[locale] ?? core}${trailing}`
  }

  const selectionStatus = core.match(/^(\d+)\/(\d+) selecciones · (\d+) Team-Up activos?$/i)
  if (selectionStatus) {
    const a = selectionStatus[1], b = selectionStatus[2], c = selectionStatus[3]
    const map: Partial<Record<SupportedLocale, string>> = { 'en-us': `${a}/${b} selections · ${c} active Team-Ups`, 'de-de': `${a}/${b} Auswahlen · ${c} aktive Team-Ups`, 'fr-fr': `${a}/${b} sélections · ${c} Team-Ups actifs`, 'pt-br': `${a}/${b} seleções · ${c} Team-Ups ativos`, 'ja-jp': `${a}/${b} 選択 · 有効な Team-Up ${c}`, 'ko-kr': `${a}/${b} 선택 · 활성 Team-Up ${c}개`, 'zh-cn': `${a}/${b} 个选择 · ${c} 个已激活 Team-Up` }
    return `${leading}${map[locale] ?? core}${trailing}`
  }

  const candidatesStatus = core.match(/^(\d+) fichas · (\d+) candidatos generados$/i)
  if (candidatesStatus) {
    const a = candidatesStatus[1], b = candidatesStatus[2]
    const map: Partial<Record<SupportedLocale, string>> = { 'en-us': `${a} slots · ${b} candidates generated`, 'de-de': `${a} Slots · ${b} Kandidaten generiert`, 'fr-fr': `${a} emplacements · ${b} candidats générés`, 'pt-br': `${a} slots · ${b} candidatos gerados`, 'ja-jp': `${a} 枠 · ${b} 候補生成`, 'ko-kr': `${a}개 슬롯 · ${b}명 후보 생성`, 'zh-cn': `${a} 个位置 · 已生成 ${b} 个候选` }
    return `${leading}${map[locale] ?? core}${trailing}`
  }

  const powerNumber = core.match(/^(PODER)\s+(\d+)$/i)
  if (powerNumber) {
    const label = dict['PODER'] ?? 'PODER'
    return `${leading}${label} ${powerNumber[2]}${trailing}`
  }

  const matchmaking = core.match(/^(\d+)\/3 opciones para matchmaking$/i)
  if (matchmaking) {
    const n = matchmaking[1]
    const map: Partial<Record<SupportedLocale, string>> = { 'en-us': `${n}/3 matchmaking options`, 'de-de': `${n}/3 Matchmaking-Optionen`, 'fr-fr': `${n}/3 options de matchmaking`, 'pt-br': `${n}/3 opções para matchmaking`, 'ja-jp': `マッチメイキング候補 ${n}/3`, 'ko-kr': `매치메이킹 후보 ${n}/3`, 'zh-cn': `${n}/3 个匹配候选` }
    return `${leading}${map[locale] ?? core}${trailing}`
  }

  const equipped = core.match(/^(\d+) elementos equipados$/i)
  if (equipped) {
    const n = equipped[1]
    const map: Partial<Record<SupportedLocale, string>> = { 'en-us': `${n} items equipped`, 'de-de': `${n} Elemente ausgerüstet`, 'fr-fr': `${n} éléments équipés`, 'pt-br': `${n} itens equipados`, 'ja-jp': `${n} 個装備`, 'ko-kr': `${n}개 장비됨`, 'zh-cn': `已装备 ${n} 项` }
    return `${leading}${map[locale] ?? core}${trailing}`
  }

  const withPartner = core.match(/^Con\s+(.+)$/i)
  if (withPartner) {
    const name = withPartner[1]
    const map: Partial<Record<SupportedLocale, string>> = { 'en-us': `With ${name}`, 'de-de': `Mit ${name}`, 'fr-fr': `Avec ${name}`, 'pt-br': `Com ${name}`, 'ja-jp': `${name} と連携`, 'ko-kr': `${name}와 함께`, 'zh-cn': `与 ${name}` }
    return `${leading}${map[locale] ?? core}${trailing}`
  }

  const boostsPartner = core.match(/^Potencia a\s+(.+)$/i)
  if (boostsPartner) {
    const name = boostsPartner[1]
    const map: Partial<Record<SupportedLocale, string>> = { 'en-us': `Boosts ${name}`, 'de-de': `Verstärkt ${name}`, 'fr-fr': `Renforce ${name}`, 'pt-br': `Fortalece ${name}`, 'ja-jp': `${name} を強化`, 'ko-kr': `${name} 강화`, 'zh-cn': `强化 ${name}` }
    return `${leading}${map[locale] ?? core}${trailing}`
  }

  const basePartner = core.match(/^Base · mejora con\s+(.+)$/i)
  if (basePartner) {
    const name = basePartner[1]
    const map: Partial<Record<SupportedLocale, string>> = { 'en-us': `Base · improves with ${name}`, 'de-de': `Basis · besser mit ${name}`, 'fr-fr': `Base · amélioré avec ${name}`, 'pt-br': `Base · melhora com ${name}`, 'ja-jp': `基本 · ${name} で強化`, 'ko-kr': `기본 · ${name}와 함께 강화`, 'zh-cn': `基础 · 与 ${name} 搭配增强` }
    return `${leading}${map[locale] ?? core}${trailing}`
  }

  const loadingGame = core.match(/^Cargando\s+(.+)…$/i)
  if (loadingGame) {
    const game = loadingGame[1]
    const map: Partial<Record<SupportedLocale, string>> = { 'en-us': `Loading ${game}…`, 'de-de': `${game} wird geladen…`, 'fr-fr': `Chargement de ${game}…`, 'pt-br': `Carregando ${game}…`, 'ja-jp': `${game} を読み込み中…`, 'ko-kr': `${game} 불러오는 중…`, 'zh-cn': `正在加载 ${game}…` }
    return `${leading}${map[locale] ?? core}${trailing}`
  }

  const generatedSelections = core.match(/^(\d+)\/(\d+) selecciones generadas$/i)
  if (generatedSelections) {
    const a = generatedSelections[1], b = generatedSelections[2]
    const map: Partial<Record<SupportedLocale, string>> = { 'en-us': `${a}/${b} selections generated`, 'de-de': `${a}/${b} Auswahlen generiert`, 'fr-fr': `${a}/${b} sélections générées`, 'pt-br': `${a}/${b} seleções geradas`, 'ja-jp': `${a}/${b} 選択を生成`, 'ko-kr': `${a}/${b} 선택 생성됨`, 'zh-cn': `已生成 ${a}/${b} 个选择` }
    return `${leading}${map[locale] ?? core}${trailing}`
  }

  const readyCatalog = core.match(/^(\d+)\s+(héroes|clases|personajes|agentes|campeones|concursantes|complexiones|leyendas)\s+listos$/i)
  if (readyCatalog) {
    const base = translateUiText(locale, `${readyCatalog[1]} ${readyCatalog[2]}`)
    const map: Partial<Record<SupportedLocale, string>> = { 'en-us': `${base} ready`, 'de-de': `${base} bereit`, 'fr-fr': `${base} prêts`, 'pt-br': `${base} prontos`, 'ja-jp': `${base} 準備完了`, 'ko-kr': `${base} 준비 완료`, 'zh-cn': `${base} 已就绪` }
    return `${leading}${map[locale] ?? core}${trailing}`
  }

  const teamupActive = core.match(/^(.+)\s+activo$/i)
  if (teamupActive) {
    const map: Partial<Record<SupportedLocale, string>> = { 'en-us': `${teamupActive[1]} active`, 'de-de': `${teamupActive[1]} aktiv`, 'fr-fr': `${teamupActive[1]} actif`, 'pt-br': `${teamupActive[1]} ativo`, 'ja-jp': `${teamupActive[1]} 有効`, 'ko-kr': `${teamupActive[1]} 활성`, 'zh-cn': `${teamupActive[1]} 已激活` }
    return `${leading}${map[locale] ?? core}${trailing}`
  }

  const roleComposite = core.match(/^(Ligero|Medio|Pesado|Tanque|Daño|Apoyo|Vanguardia|Duelista|Estratega|Flexible)\s*·\s*(.+)$/i)
  if (roleComposite) {
    const roleKey = Object.keys(combined).find((key) => key.toLocaleLowerCase('es') === roleComposite[1].toLocaleLowerCase('es'))
    const translatedRole = roleKey ? combined[roleKey] : roleComposite[1]
    const suffixMap: Partial<Record<SupportedLocale, string>> = { 'en-us': 'complete', 'de-de': 'vollständig', 'fr-fr': 'complet', 'pt-br': 'completo', 'ja-jp': '完了', 'ko-kr': '완료', 'zh-cn': '完整' }
    const suffix = roleComposite[2].toLocaleLowerCase('es') === 'completo' ? (suffixMap[locale] ?? roleComposite[2]) : roleComposite[2]
    return `${leading}${translatedRole} · ${suffix}${trailing}`
  }

  return value
}

function isLocalizedUiNode(node: Text): boolean {
  const parent = node.parentElement
  return Boolean(parent?.closest('.workspace, .principal-generate-dock'))
}

function translateTextNode(node: Text, locale: SupportedLocale) {
  if (!isLocalizedUiNode(node)) return
  const current = node.data
  let source = sourceText.get(node)
  const lastLocalized = localizedText.get(node)

  // React frequently reuses the same Text node when a dynamic value changes.
  // If its current text no longer matches the last value written by the
  // localizer, the application has supplied a NEW source string. Never
  // restore the stale source that used to occupy this node.
  if (lastLocalized !== undefined && current !== lastLocalized) {
    if (!isUiSource(current)) {
      sourceText.delete(node)
      localizedText.delete(node)
      return
    }
    source = current
    sourceText.set(node, source)
  } else if (source === undefined || !isUiSource(source)) {
    if (!isUiSource(current)) return
    source = current
    sourceText.set(node, source)
  }

  const translated = translateUiText(locale, source)
  localizedText.set(node, translated)
  if (node.data !== translated) node.data = translated
}

function translateTree(root: Node, locale: SupportedLocale) {
  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root as Text, locale)
    return
  }
  if (!(root instanceof Element) && !(root instanceof DocumentFragment)) return
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()
  while (node) {
    const parent = node.parentElement
    if (parent && !['SCRIPT', 'STYLE', 'TEXTAREA'].includes(parent.tagName)) translateTextNode(node as Text, locale)
    node = walker.nextNode()
  }
}

export function installUiLocalization(locale: SupportedLocale): (() => void) | undefined {
  const root = document.body
  if (!root) return undefined
  translateTree(root, locale)
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'characterData') translateTextNode(mutation.target as Text, locale)
      mutation.addedNodes.forEach((node) => translateTree(node, locale))
    }
  })
  observer.observe(root, { subtree: true, childList: true, characterData: true })
  return () => observer.disconnect()
}

export function useUiLocalization(locale: SupportedLocale) {
  useEffect(() => installUiLocalization(locale), [locale])
}
