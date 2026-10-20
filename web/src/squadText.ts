import type { SupportedLocale } from './localization'

type Messages = { showcase: string; exit: string; move: string; hint: string; selected: string; moved: string; cancelled: string }
const es: Messages = {
  showcase: 'Modo Escaparate', exit: 'Salir del Escaparate', move: 'Mover ficha de {player}',
  hint: 'Arrastra o selecciona otra ficha como destino. Usa las flechas, Inicio o Fin para mover con el teclado.',
  selected: '{player}: selecciona la ficha de destino.', moved: '{player}: posición {position} de {count}.', cancelled: 'Movimiento cancelado.',
}
const messages: Record<SupportedLocale, Messages> = {
  'es-mx': es, 'es-es': es,
  'en-us': { showcase: 'Showcase mode', exit: 'Exit showcase', move: 'Move {player}’s card', hint: 'Drag or select another card as the destination. Use the arrow keys, Home or End to move with the keyboard.', selected: '{player}: select the destination card.', moved: '{player}: position {position} of {count}.', cancelled: 'Move cancelled.' },
  'pt-br': { showcase: 'Modo vitrine', exit: 'Sair da vitrine', move: 'Mover ficha de {player}', hint: 'Arraste ou selecione outra ficha como destino. Use as setas, Home ou End para mover com o teclado.', selected: '{player}: selecione a ficha de destino.', moved: '{player}: posição {position} de {count}.', cancelled: 'Movimento cancelado.' },
  'fr-fr': { showcase: 'Mode vitrine', exit: 'Quitter la vitrine', move: 'Déplacer la fiche de {player}', hint: 'Faites glisser ou sélectionnez une autre fiche comme destination. Utilisez les flèches, Début ou Fin pour déplacer au clavier.', selected: '{player} : sélectionnez la fiche de destination.', moved: '{player} : position {position} sur {count}.', cancelled: 'Déplacement annulé.' },
  'de-de': { showcase: 'Präsentationsmodus', exit: 'Präsentation verlassen', move: 'Karte von {player} verschieben', hint: 'Ziehen oder eine andere Karte als Ziel auswählen. Mit Pfeiltasten, Pos1 oder Ende per Tastatur verschieben.', selected: '{player}: Zielkarte auswählen.', moved: '{player}: Position {position} von {count}.', cancelled: 'Verschieben abgebrochen.' },
  'ja-jp': { showcase: 'ショーケースモード', exit: 'ショーケースを終了', move: '{player}のカードを移動', hint: 'ドラッグするか、移動先のカードを選択します。矢印キー、Home、Endでも移動できます。', selected: '{player}：移動先のカードを選択してください。', moved: '{player}：{count}枚中{position}番目。', cancelled: '移動をキャンセルしました。' },
  'ko-kr': { showcase: '쇼케이스 모드', exit: '쇼케이스 종료', move: '{player}의 카드 이동', hint: '드래그하거나 이동할 위치의 카드를 선택하세요. 방향키, Home, End 키로도 이동할 수 있습니다.', selected: '{player}: 이동할 위치의 카드를 선택하세요.', moved: '{player}: {count}개 중 {position}번째.', cancelled: '이동이 취소되었습니다.' },
  'zh-cn': { showcase: '展示模式', exit: '退出展示', move: '移动{player}的卡片', hint: '拖动或选择另一张卡片作为目标。也可使用方向键、Home 或 End 移动。', selected: '{player}：请选择目标卡片。', moved: '{player}：第{position}张，共{count}张。', cancelled: '已取消移动。' },
}

export function squadText(locale: SupportedLocale, key: keyof Messages, values: Record<string, string | number> = {}): string {
  return messages[locale][key].replace(/\{(\w+)\}/g, (token, name: string) => String(values[name] ?? token))
}
