-- RPC function to batch query conversation_member_states for multiple conversations
-- This optimizes the unread count calculation by fetching all states in a single query
-- instead of making N separate queries (one per conversation)

CREATE OR REPLACE FUNCTION get_batch_conversation_member_states(
  p_user_id UUID,
  p_conversation_ids UUID[]
)
RETURNS TABLE (
  conversation_id UUID,
  last_read_message_id UUID,
  visible_message_id UUID
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cms.conversation_id,
    cms.last_read_message_id,
    cms.visible_message_id
  FROM conversation_member_states cms
  WHERE cms.user_id = p_user_id
    AND cms.conversation_id = ANY(p_conversation_ids);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_batch_conversation_member_states TO authenticated;
