import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ success: true, data: null })
}

export async function PATCH() {
  return NextResponse.json({ success: false, error: 'Method not allowed' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ success: false, error: 'Method not allowed' }, { status: 405 })
}
