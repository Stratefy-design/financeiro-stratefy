import { SignUp } from "@clerk/nextjs";

export default function Page() {
    return (
        <div className="clerk-glass">
            <SignUp
                appearance={{
                    variables: {
                        colorBackground: "transparent",
                    },
                    elements: {
                        card: "bg-transparent shadow-none",
                        cardBox: "bg-transparent shadow-none border-none",
                        scrollBox: "bg-transparent shadow-none",
                        header: "hidden", // Keep splash screen clean
                    }
                }}
            />
        </div>
    );
}
