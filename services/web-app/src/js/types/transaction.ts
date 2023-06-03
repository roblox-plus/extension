// Information about a stored economy transaction.
type Transaction = {
  // The ID of the transaction.
  id: string;

  // The transaction type.
  transaction_type: string;

  // The ID of the buyer of the item.
  buyer_user_id: number;

  // The ID of the transaction recipient (the seller).
  owner_id: number;

  // The type of entity, pairing with the owner_id.
  owner_type: string;

  // When the transaction occurred.
  created: Date;

  // The amount of Robux spent on the item.
  gross_revenue: number;

  // The net revenue the recipient of the transaction received.
  net_revenue: number;

  // The current status of the funds relating to this transaction.
  hold_status: string;

  // The ID of the item that was transacted on.
  item_id: number;

  // The name of the item that was transacted on.
  item_name: string;

  // The type of item involved in the transaction.
  item_type: string;

  // The name of the universe associated with the item.
  universe_name: string;

  // The ID of the universe associated with the item.
  universe_id: number;

  // The ID of the place that the item was sold in.
  seller_place_id: number;
};

export default Transaction;
