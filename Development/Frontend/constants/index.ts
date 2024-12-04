
import onboarding1 from "../assets/images/onboarding1.jpg";
import onboarding2 from "@/assets/images/onboarding2.jpg";
import onboarding3 from "@/assets/images/onboarding3.png";

export const images = {
    onboarding1,
    onboarding2,
    onboarding3,
};

// export const icons = {
//     arrowDown,
//     arrowUp,
//     backArrow,
//     chat,
//     checkmark,
//     close,
//     dollar,
//     email,
//     eyecross,
//     google,
//     home,
//     list,
//     lock,
//     map,
//     marker,
//     out,
//     person,
//     pin,
//     point,
//     profile,
//     search,
//     selectedMarker,
//     star,
//     target,
//     to,
// };

export const onboarding = [
    {
        id: 1,
        title: "Simplify Construction Management",
        description:
            "with the OnSite app, you can manage your construction site from anywher at anytime.",
        image: images.onboarding1,
    },
    {
        id: 2,
        title: "All your construction task in one app",
        description:
            "Onsite app lets you track your attendance, budgets and projects progress. ",
        image: images.onboarding2,
    },
    {
        id: 3,
        title: "View your project in 3D",
        description:
            "with OnSite you can easily view you Construction project in 3D.",
        image: images.onboarding3,
    },
];

export const data = {
    onboarding,
};