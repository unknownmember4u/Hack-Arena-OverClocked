import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const REQUESTS_JSON_PATH = resolve(process.cwd(), 'Data/requests.json');

/** GET — fetch all pending or processed requests */
export async function GET() {
  try {
    if (!existsSync(REQUESTS_JSON_PATH)) {
      return NextResponse.json([]);
    }
    const raw = readFileSync(REQUESTS_JSON_PATH, 'utf8');
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

/** POST — create a new property request from an owner */
export async function POST(req: NextRequest) {
  try {
    const newRequest = await req.json();
    
    // Ensure the data directory exists
    if (!existsSync(REQUESTS_JSON_PATH)) {
      writeFileSync(REQUESTS_JSON_PATH, '[]', 'utf8');
    }
    
    const raw = readFileSync(REQUESTS_JSON_PATH, 'utf8');
    const requests = JSON.parse(raw);
    
    // Assign a local Request ID if not present
    newRequest.reqId = 'REQ_' + Date.now();
    newRequest.status = 'pending';
    newRequest.submittedAt = new Date().toISOString();
    
    requests.push(newRequest);
    
    writeFileSync(REQUESTS_JSON_PATH, JSON.stringify(requests, null, 2), 'utf8');
    
    return NextResponse.json({ success: true, reqId: newRequest.reqId });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}

/** DELETE — remove or update a request status */
export async function PATCH(req: NextRequest) {
  try {
    const { reqId, status } = await req.json();
    const raw = readFileSync(REQUESTS_JSON_PATH, 'utf8');
    const requests = JSON.parse(raw);
    
    const index = requests.findIndex((r: any) => r.reqId === reqId);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }
    
    requests[index].status = status;
    requests[index].reviewedAt = new Date().toISOString();
    
    writeFileSync(REQUESTS_JSON_PATH, JSON.stringify(requests, null, 2), 'utf8');
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}
