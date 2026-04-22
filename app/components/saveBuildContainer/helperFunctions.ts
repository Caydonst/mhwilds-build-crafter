
export function checkName(buildName: string) {
    if (buildName === "" && buildName.length > 30) {
        return false;
    } else if (buildName.trim() === "") {
        return false;
    }
    return true;
}