//[assignment] write your own unit test to show that your Mastermind variation circuit is working as expected
const chai = require('chai');
const { resolve } = require('path');
const F1Field = require('ffjavascript').F1Field;
const Scalar = require('ffjavascript').Scalar;
exports.p = Scalar.fromString(
  '21888242871839275222246405745257275088548364400416034343698204186575808495617',
);
const Fr = new F1Field(exports.p);

const wasm_tester = require('circom_tester').wasm;
const buildPoseidon = require('circomlibjs').buildPoseidon;

const assert = chai.assert;

describe('MastermindVariation test', function () {
  let Posiden;
  let HasherC;
  
  this.timeout(100000);

  before(async () => {
    //build the posiden hasher and make one
    Posiden = await buildPoseidon();
    HasherC = Posiden.F;
    
  });
  

  it('Should pass', async () => {
    const circuit = await wasm_tester(resolve('./contracts/circuits/MastermindVariation.circom'),
    );

    const res = Posiden([33, 5, 7, 6]);

    let witness;
    witness = await circuit.calculateWitness(
      {
        pubGuessA: 1,
        pubGuessB: 2,
        pubGuessC: 3,
        privSolnA: 4,
        privSolnB: 5,
        privSolnC: 6,
        pubNumHit: 0,
        pubNumBlow: 0,
        pubSolnHash: HasherC.toObject(res),
        privSalt: 33,
      },
      true,
    );
      //check if they are equal
    assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
    assert(HasherC.eq(HasherC.e(witness[1]), HasherC.e(res)));
    await circuit.assertOut(witness, { solnHashOut: HasherC.toObject(res) });
    await circuit.checkConstraints(witness);
  });
});