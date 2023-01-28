import test from 'ava'
import {
  stringToUtf8,
  uft8ToString,
  decodeBase64,
  encodeBase64,
  createEncoder,
} from '../src'

test('base64', async (t) => {
  const str = 'this is a nice string'
  const b64 = encodeBase64(stringToUtf8(str))
  t.is(b64, 'dGhpcyBpcyBhIG5pY2Ugc3RyaW5n')
  t.true(str !== b64)
  const strAgain = uft8ToString(decodeBase64(b64))
  t.is(strAgain, str)
})

test('stringToUtf8', async (t) => {
  const str = 'hello'
  const utf = stringToUtf8(str)
  const strAgain = uft8ToString(utf)
  t.is(strAgain, str)
})

test('createEncoder', async (t) => {
  const chars = [
    '(',
    ')',
    '<',
    '>',
    '@',
    ',',
    ';',
    ':',
    '\\',
    '"',
    '/',
    '[',
    ']',
    '?',
    '=',
    '{',
    '}',
    ' ',
  ]
  const str = '$100he*llo*bla=*'
  const { encode, decode } = createEncoder(chars, ['*'])
  const s = encode(str)
  const x = decode(s)
  t.true(s !== str)
  t.is(x, str)
})

test('createEncoder long', async (t) => {
  const chars: string[] = []
  for (let i = 0; i < 200; i++) {
    chars.push(String.fromCharCode(i + 97))
  }
  const str = '$100hellobla='
  const { encode, decode } = createEncoder(chars)
  const s = encode(str)
  t.true(s !== str)
  const x = decode(s)
  t.is(x, str)
})

test('createEncoder 🥹', async (t) => {
  const chars: string[] = ['🥹']
  const str = '1🥹flapfl*ap!*'
  const { encode, decode } = createEncoder(chars, ['*'])
  const s = encode(str)
  t.true(s !== str)
  const x = decode(s)
  t.is(x, str)
})

test('createEncoder compressor', async (t) => {
  const chars: string[] = [
    'wow',
    'this',
    'and',
    'nice',
    'little',
    'Hello',
    'great',
    'write',
    'about',
    'thing',
    '!',
  ]
  const str =
    'wow this is nice little thing to write about! wow Hello and this is great'
  const { encode, decode } = createEncoder(chars, ['*'])
  const s = encode(str)
  t.true(s !== str)
  const x = decode(s)
  t.is(x, str)
  t.true(s.length < str.length)
})

test('createEncoder multi encode-char single len', async (t) => {
  const chars: string[] = [' ', '!']
  const str =
    'wow this is nice little thing to write about! wow Hello and this is great'
  const { encode, decode } = createEncoder(chars, ['A', 'B', 'C', 'D'])

  const s = encode(str)
  t.true(s !== str)
  const x = decode(s)
  t.is(x, str)
  t.true(true)
})

test('createEncoder multi encode-char', async (t) => {
  const chars: string[] = [
    'wow',
    'this',
    'and',
    'nice',
    'little',
    'Hello',
    'great',
    'write',
    'about',
    'thing',
    ' ',
    '!',
  ]
  const str =
    'wow this is nice little thing to write about! wow Hello and this is great'
  const { encode, decode } = createEncoder(chars, ['A', 'B', 'C', 'D'])
  const s = encode(str)
  t.true(s !== str)
  const x = decode(s)
  t.is(x, str)
})

test('createEncoder multi encode-char more then 35 chars', async (t) => {
  const chars: string[] = [
    'wow',
    'this',
    'and',
    'nice',
    'little',
    'Hello',
    'great',
    'write',
    'about',
    'thing',
    ' ',
    '!',
    '\n',
  ]
  for (let i = 0; i < 50; i++) {
    chars.push(String.fromCharCode(97 + i))
  }
  const str = `wow this is nice little thing to write 
  about! wow Hello and this is great wow this is
  nice little thing to write about! wow Hello and 
  this is great wow this is nice little thing 
  to write about! wow Hello and this is great`
  const { encode, decode } = createEncoder(chars, [
    'Z',
    'A',
    'B',
    'C',
    'D',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'z',
    '0',
    'x',
    'X',
  ])
  const s = encode(str)
  t.true(s !== str)
  const x = decode(s)
  t.is(x, str)
})

test('createEncoder multi encode-char perf', async (t) => {
  const chars: string[] = [
    'wow',
    'this',
    'and',
    'nice',
    'little',
    'Hello',
    'great',
    'write',
    'about',
    'thing',
    ' ',
    '!',
    '\n',
  ]
  const str = `wow this is nice little thing to write 
  about! wow Hello and this is great wow this is
  nice little thing to write about! wow Hello and 
  this is great wow this is nice little thing 
  to write about! wow Hello and this is great`
  const { encode, decode } = createEncoder(chars, [
    'Z',
    'A',
    'B',
    'C',
    'D',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'z',
    '0',
    'x',
    'X',
  ])
  const d = Date.now()
  for (let i = 0; i < 1e4; i++) {
    encode(str)
  }
  console.info(Date.now() - d, 'ms', '10k encode /', str.length)
  const s = encode(str)
  const d2 = Date.now()
  for (let i = 0; i < 1e4; i++) {
    decode(s)
  }
  console.info(Date.now() - d2, 'ms', '10k decode /', str.length)
  t.true(s !== str)
  const x = decode(s)
  t.is(x, str)
})

test('createEncoder simple case  perf', async (t) => {
  const chars: string[] = [
    'wow',
    'this',
    'and',
    'nice',
    'little',
    'Hello',
    'great',
    'write',
    'about',
    'thing',
    ' ',
    '!',
    '\n',
  ]
  const str = `wow this is nice little thing to write 
  about! wow Hello and this is great wow this is
  nice little thing to write about! wow Hello and 
  this is great wow this is nice little thing 
  to write about! wow Hello and this is great`
  const { encode, decode } = createEncoder(chars, ['Z'])
  const d = Date.now()
  for (let i = 0; i < 1e4; i++) {
    encode(str)
  }
  console.info(
    Date.now() - d,
    'ms',
    '10k encode simple /',
    str.length,
    'char len'
  )
  const s = encode(str)
  const d2 = Date.now()
  for (let i = 0; i < 1e4; i++) {
    decode(s)
  }
  console.info(
    Date.now() - d2,
    'ms',
    '10k decode simple /',
    str.length,
    'char len'
  )
  t.true(s !== str)
  const x = decode(s)
  t.is(x, str)
})
