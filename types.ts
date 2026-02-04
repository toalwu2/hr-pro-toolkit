
export interface Participant {
  id: string;
  name: string;
}

export interface Group {
  id: number;
  name: string;
  members: Participant[];
}

export interface Winner {
  participant: Participant;
  prize?: string;
  timestamp: number;
}
