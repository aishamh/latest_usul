import SwiftUI

// Compatibility shim: define colors referenced by expo-dev-menu
extension Color {
    static var expoSystemBackground: Color {
        #if canImport(UIKit)
        return Color(UIColor.systemBackground)
        #else
        return Color.white
        #endif
    }

    static var expoSecondarySystemBackground: Color {
        #if canImport(UIKit)
        return Color(UIColor.secondarySystemBackground)
        #else
        return Color(white: 0.95)
        #endif
    }

    static var expoSystemGray4: Color {
        #if canImport(UIKit)
        return Color(UIColor.systemGray4)
        #else
        return Color(white: 0.7)
        #endif
    }

    static var expoSystemGray6: Color {
        #if canImport(UIKit)
        return Color(UIColor.systemGray6)
        #else
        return Color(white: 0.9)
        #endif
    }
}


