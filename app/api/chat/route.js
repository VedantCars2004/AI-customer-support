import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = 'AIzaSyCG-IQZx6QeXTzjhxphuHJCVMgSbPlzNaE'; // Replace with your actual API key

export async function POST(req) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const data = await req.json();
  const prompt = data.map(msg => `${msg.role}: ${msg.content}`).join('\n');

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return NextResponse.json({ result: text });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return NextResponse.json({ error: "An error occurred while processing your request." }, { status: 500 });
  }
}