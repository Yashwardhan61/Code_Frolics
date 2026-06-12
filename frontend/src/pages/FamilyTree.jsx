import React from 'react';
import { Network } from 'lucide-react';

export default function FamilyTree() {
    return (
        <div className="max-w-5xl mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--brand-brown-800)' }}>Family Tree</h1>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                    <Network className="w-12 h-12 text-amber-600" />
                </div>
                <h3 className="text-2xl font-medium text-gray-900 mb-2 font-serif">Coming Soon</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                    The interactive Family Tree feature is currently under development. Soon you'll be able to map out your entire family history and connect stories to specific generations!
                </p>
            </div>
        </div>
    );
}
