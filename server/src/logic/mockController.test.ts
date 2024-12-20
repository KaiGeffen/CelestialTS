// import { MockController } from './mockController'
// import { ServerModel, Status } from './ServerModel'
// import { dove, nightmare, hungry_ghost, boa, sickness } from './Catalog'

// describe('MockController', () => {
//   test('TestMorning - test_nightmare', () => {
//     const deck1 = Array(15).fill(dove)
//     const deck2 = Array(15).fill(nightmare)
//     const mock = new MockController(deck1, deck2)
//     const model = mock.model

//     // Round 1
//     mock.onPlayerInput(0, 1)
//     mock.onPlayerPass(1)
//     mock.onPlayerPass(0)

//     // Round 2
//     mock.onPlayerInput(0, 1)
//     mock.onPlayerInput(1, 1)
//     mock.onPlayerInput(0, 1)
//     mock.onPlayerPass(1)
//     mock.onPlayerPass(0)

//     // Assertions
//     expect(model.hand[1][4]).toBe(shadow)
//   })

//   test('TestNourish - test_boa_negative', () => {
//     const deck1 = [hungry_ghost, boa, hungry_ghost]
//     const deck2 = Array(15).fill(dove)
//     const mock = new MockController(deck1, deck2)
//     const model = mock.model
//     mock.setUnlimitedBreath()

//     // Round 1 (Hungry Ghost, Boa)
//     mock.onPlayerInput(0, 0)
//     mock.onPlayerPass(1)
//     mock.onPlayerInput(0, 0)
//     mock.onPlayerPass(1)
//     mock.onPlayerPass(0)

//     // Assertions
//     expect(model.hand[1].length).toBe(4)
//   })

//   test('TestNourish - test_boa_nourish_cancels', () => {
//     const deck1 = [boa, dove, dove]
//     const deck2 = Array(15).fill(sickness)
//     const mock = new MockController(deck1, deck2)
//     const model = mock.model
//     mock.setUnlimitedBreath()
//     for (let i = 0; i < 4; i++) {
//       model.status[0].push(Status.NOURISH)
//     }

//     // Round 1 (4 nourish, Sickness, Boa)
//     mock.onPlayerPass(0)
//     mock.onPlayerInput(1, 0)
//     mock.onPlayerInput(0, 0)
//     mock.onPlayerPass(1)
//     mock.onPlayerPass(0)

//     // Assertions
//     expect(model.hand[1].length).toBe(4)
//   })
// })
