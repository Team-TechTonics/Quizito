// Test PDF Service - Navigate to /test-pdf to use this
import React from 'react';
import PDFServiceTester from '../components/PDFServiceTester';

export default function TestPDFService() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
            <div className="container mx-auto px-4">
                <PDFServiceTester />
            </div>
        </div>
    );
}
