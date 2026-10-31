import { HoldError, placeHold } from '../lib/holds.mjs'

export const tools = {
  place_hold: {
    description: 'Place a hold on a copy for the calling member.',
    inputSchema: { type: 'object', properties: { copyId: { type: 'string' } }, required: ['copyId'] },
    run({ member, input }) {
      try {
        return { content: placeHold({ memberId: member.id, copyId: input.copyId }) }
      } catch (error) {
        if (error instanceof HoldError) return { isError: true, content: { error: error.code, message: error.message } }
        throw error
      }
    },
  },
}
