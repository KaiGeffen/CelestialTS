export const Flags = {
	// Running a local instance instead of on the server
	local: location.port === '4949',

	// Include cards in development
	devCards: new URLSearchParams(window.location.search).has('dev'),

	// See cards in the opponent's hand
	peek: new URLSearchParams(window.location.search).has('peek'),
}
