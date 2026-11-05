import type { AbilityKey, SkillKey } from '../types/dnd5e';

export const ABILITY_META: Record<
  AbilityKey,
  { abbr: string; name: string; summary: string; tableTip: string }
> = {
  strength: {
    abbr: 'FOR',
    name: 'Força',
    summary:
      'Mede a potência física bruta, treinamento atlético e a capacidade de empurrar, erguer ou quebrar objetos.',
    tableTip:
      'Role 1d20 no dado físico e some este modificador para testes de Força, agarrões e ataques corpo a corpo com armas pesadas.',
  },
  dexterity: {
    abbr: 'DES',
    name: 'Destreza',
    summary:
      'Mede agilidade, reflexos, equilíbrio e precisão com armas de acuidade ou à distância.',
    tableTip:
      'Usado na Iniciativa no início do combate, na Classe de Armadura e para evitar explosões (como Bola de Fogo).',
  },
  constitution: {
    abbr: 'CON',
    name: 'Constituição',
    summary:
      'Representa saúde, vigor, resistência a venenos e capacidade de manter a Concentração em magias ao sofrer dano.',
    tableTip:
      'Sempre que sofrer dano concentrando uma magia, role 1d20 + Salvaguarda de CON (CD 10 ou metade do dano sofrido).',
  },
  intelligence: {
    abbr: 'INT',
    name: 'Inteligência',
    summary:
      'Mede acuidade mental, memória histórica, raciocínio dedutivo e conhecimento arcano ou religioso.',
    tableTip:
      'Usado para investigar pistas ocultas em salas, decifrar runas e lembrar fraquezas de criaturas.',
  },
  wisdom: {
    abbr: 'SAB',
    name: 'Sabedoria',
    summary:
      'Reflete sintonia com o ambiente, percepção de perigos, leitura de intenções e força de vontade contra encantamentos.',
    tableTip:
      'Sua Percepção Passiva (10 + bônus de Percepção) é usada pelo Mestre sem você precisar rolar dados.',
  },
  charisma: {
    abbr: 'CAR',
    name: 'Carisma',
    summary:
      'Mede presença de espírito, liderança, eloquência e a força da sua convicção (atributo de conjuração de Paladinos, Bardos, Feiticeiros e Bruxos).',
    tableTip:
      'Some este modificador ao seu d20 físico em testes sociais e disputas de presença.',
  },
};

export const SKILL_DESCRIPTIONS: Record<SkillKey, string> = {
  acrobatics:
    'Manter-se de pé em superfícies escorregadias, equilibrar-se em cordas bambas ou escapar de um agarrão inimigo.',
  animal_handling:
    'Acalmar um animal domesticado, evitar que uma montaria se assuste em combate ou intuir a intenção de uma fera.',
  arcana:
    'Recordar conhecimento sobre magias, itens mágicos, símbolos arcanos, planos de existência e criaturas astrais.',
  athletics:
    'Escalar penhascos, saltar distâncias além do normal, nadar contra correntezas ou derrubar/agarrar um oponente em combate.',
  performance:
    'Cantar, declamar, tocar um instrumento ou atuar para cativar uma plateia em uma taverna ou corte nobre.',
  deception:
    'Esconder a verdade verbalmente ou por disfarce, manter um blefe diante de guardas ou criar uma distração convincente.',
  stealth:
    'Ocultar-se nas sombras, esgueirar-se silenciosamente por sentinelas ou aproximar-se sem ser notado.',
  history:
    'Recordar eventos históricos, linhagens reais, guerras antigas, brasões de casas nobres e civilizações perdidas.',
  intimidation:
    'Influenciar alguém por meio de ameaças diretas, postura hostil ou presença imponente para extrair informações ou recuo.',
  insight:
    'Determinar as verdadeiras intenções de uma criatura, perceber mentiras, nervosismo ou prever o próximo passo de alguém.',
  investigation:
    'Procurar pistas ocultas, deduzir o funcionamento de armadilhas mecânicas, analisar ferimentos ou encontrar passagens secretas.',
  medicine:
    'Estabilizar um aliado moribundo (CD 10 sem gastar kit) ou diagnosticar doenças e venenos.',
  nature:
    'Recordar informações sobre terreno, plantas, clima, ciclos naturais e bestas selvagens.',
  perception:
    'Notar a presença de algo pelo ouvido, visão ou olfato: ouvir passos atrás de uma porta ou avistar emboscadas.',
  persuasion:
    'Influenciar um indivíduo ou grupo com tato, diplomacia, etiqueta nobre ou argumentos honestos.',
  sleight_of_hand:
    'Plantar algo em alguém, esconder um objeto na palma da mão ou bater uma carteira sem ser visto.',
  religion:
    'Recordar dogmas, rituais sagrados, hierarquias eclesiásticas, símbolos profanos e hábitos de mortos-vivos ou demônios.',
  survival:
    'Seguir rastros na mata, caçar, guiar o grupo por terras ermas, prever tempestades e evitar perigos naturais.',
};
