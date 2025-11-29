
export interface Character {
  id: string;
  name: string;
  image: string;
  type: 'player' | 'target' | 'npc';
  style?: React.CSSProperties;
}

export interface ScriptNode {
  id: string;
  narrative: string; 
  speaker: string; 
  bg?: string; 
  
  // Visual Actions
  action?: 'daily' | 'happy' | 'pajamas' | 'sleep' | 'npc_show' | 'npc_hide_drop' | 'hufeng_show' | 'hufeng_hide_drop' | 'drop_note' | 'drop_receipt' | 'drop_card' | 'drop_sketch' | 'drop_hairtie' | 'drop_coin';
  
  // Effects
  effect?: 'rain' | 'code' | 'clear';

  // Navigation
  next?: string; // ID of the next node (shows "Next" button)
  collectNext?: string; // ID of next node ONLY after collecting the active drop
  endDay?: boolean; // If true, shows "Next Day" prompt
  
  // Interactive Elements
  choices?: {
    text: string;
    next?: string; 
    act?: () => void; 
    collectItem?: string; 
    showProp?: string; 
    ending?: 'HE' | 'BE' | 'NE';
    endDay?: boolean;
  }[];
  
  phone?: string[]; 
  phoneNext?: string; 
}

export interface Item {
  id: string;
  name: string;
  desc: string;
  icon: string;
}

export interface GameState {
  day: number;
  inventory: string[]; 
  history: string[];
  stats: {
    rationality: number;
    affinity: number;
  };
}
