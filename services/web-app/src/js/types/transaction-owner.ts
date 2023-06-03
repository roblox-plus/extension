import AgentType from '../enums/agentType';

type TransactionOwner = {
  type: AgentType;
  id: number;
  name: string;
  thumbnail: string;
};

export default TransactionOwner;
