
import { paddockManagers, farms, paddockType, paddocks } from "./data";

const unionPaddockFarms = joinPaddockFarms();

function joinPaddockFarms() {
    var farmsNewName = farms.map(farms => {
        return { farmId: farms.id, nameFarms: farms.name };
    });
    var paddockTypeNewName = paddockType.map(paddockType => {
        return { paddockTypeId: paddockType.id, paddockTypeName: paddockType.name };
    });
    var paddockManagersNewName = paddockManagers.map(paddockManagers => {
        return { paddockManagerId: paddockManagers.id, taxNumber: paddockManagers.taxNumber, name: paddockManagers.name };
    });

    const mergeByManagerId = (a1, a2) =>
        a1.map(itm =>
        ({
            ...a2.find((item) =>
                (item.paddockManagerId === itm.paddockManagerId) && item),
            ...itm
        }));
    const mergeByTypeId = (a1, a2) =>
        a1.map(itm =>
        ({
            ...a2.find((item) =>
                (item.paddockTypeId === itm.paddockTypeId) && item),
            ...itm
        }));
    const mergeByFarmId = (a1, a2) =>
        a1.map(itm =>
        ({
            ...a2.find((item) =>
                (item.farmId === itm.farmId) && item),
            ...itm
        }));

    let mergePaddockManagers = mergeByManagerId(paddocks, paddockManagersNewName);
    let mergePaddockManagersType = mergeByTypeId(mergePaddockManagers, paddockTypeNewName);
    let mergePaddockManagersTypeFarm = mergeByFarmId(mergePaddockManagersType, farmsNewName);

    return mergePaddockManagersTypeFarm;
}


// 0 Arreglo con los ids de los responsables de cada cuartel
function listPaddockManagerIds() {
    return paddockManagers.map((paddockManager) => paddockManager.id);
};

// 1 Arreglo con los ruts de los responsables de los cuarteles, ordenados por nombre
function listPaddockManagersByName(ascend = true) {
    let managersAux_ = paddockManagers.slice(0, paddockManagers.length);
    let managersOrderByRut = managersAux_.sort(function (a, b) {
        let aWithoutVerifiedNumber = a.taxNumber.slice(0, a.taxNumber.length - 1);
        let bWithoutVerifiedNumber = b.taxNumber.slice(0, b.taxNumber.length - 1);
        if (ascend) {
            return aWithoutVerifiedNumber - bWithoutVerifiedNumber;
        } else {
            return bWithoutVerifiedNumber - aWithoutVerifiedNumber;
        }
    });
    return managersOrderByRut.map((clientsOrderByRut) => clientsOrderByRut.id);
};

// 2 Arreglo con los nombres de cada tipo de cultivo, ordenados decrecientemente por la suma TOTAL de la cantidad de hectáreas plantadas de cada uno de ellos.
function sortPaddockTypeByTotalArea(paddock = paddocks, type = paddockType) {
    let totalBalanceByType = paddock.reduce((sumatory, eachElement) => {
        sumatory[eachElement.paddockTypeId] = (sumatory[eachElement.paddockTypeId] || 0) + eachElement.area;
        return sumatory;
    }, {});

    let totalBalanceByTypeOrderedByName = Object.keys(totalBalanceByType).sort(
        function (a, b) {
            return totalBalanceByType[b] - totalBalanceByType[a]
        });
    // Obtener nombres por id
    for (let x in totalBalanceByTypeOrderedByName) {
        for (let y in type) {
            if (type[y].id == totalBalanceByType[x]) {
                totalBalanceByTypeOrderedByName[x] = type[y].name;
            }
        }
    }
    return totalBalanceByTypeOrderedByName;
}

// 3 Arreglo con los nombres de los administradores, ordenados decrecientemente por la suma TOTAL de hectáreas que administran.
function sortFarmManagerByAdminArea(paddock = paddocks, farmer = paddockManagers) {
    let totalBalanceByFarmer = paddock.reduce((sumatory, eachElement) => {
        sumatory[eachElement.paddockManagerId] = (sumatory[eachElement.paddockManagerId] || 0) + eachElement.area;
        return sumatory;
    }, {});

    let totalBalanceByTypeOrderedByArea = Object.keys(totalBalanceByFarmer).sort(
        function (a, b) {
            return totalBalanceByFarmer[b] - totalBalanceByFarmer[a]
        });
    // Obtener nombres por id
    for (let x in totalBalanceByTypeOrderedByArea) {
        for (let y in farmer) {
            if (farmer[y].id == totalBalanceByFarmer[x]) {
                totalBalanceByTypeOrderedByArea[x] = farmer[y].name;
            }
        }
    }
    return totalBalanceByTypeOrderedByArea;
}

// 4 Objeto en que las claves sean los nombres de los campos y los valores un arreglo con los ruts de sus administradores ordenados alfabéticamente por nombre.
function farmManagerNames() {
    var objectFarmManagersName = {};
    for (let farm in farms) {
        let nameFarmManagerByFarms = unionPaddockFarms.filter((farmer) => {
            return farmer.nameFarms === farms[farm].name
        }).map(farmer => farmer.name).sort()

        let uniqueValueNameFarmerByFarm = Array.from(new Set(nameFarmManagerByFarms));
        let farmerContainer = [];
        for (let index in uniqueValueNameFarmerByFarm) {
            existFarmer = paddockManagers.filter(farmer => {
                return farmer.name === uniqueValueNameFarmerByFarm[index]
            });
            if (existFarmer.length > 0) {
                farmerContainer.push(existFarmer[0]);
            }
        }
        objectFarmManagersName[farms[farm].name] = farmerContainer.map(farmer => farmer.taxNumber);
    }
    return objectFarmManagersName;
}

// 5 Arreglo ordenado decrecientemente con los m2 totales de cada campo que tengan más de 2 hectáreas en Paltos
function biggestAvocadoFarms() {
    return unionPaddockFarms.filter(paddockType => paddockType.paddockTypeName === 'PALTOS' && paddockType.area > 20000)
        .map((paddocks) => paddocks.area).sort((a, b) => b - a);
}

// 6 Arreglo con nombres de los administradores de la FORESTAL Y AGRÍCOLA LO ENCINA, ordenados por nombre, que trabajen más de 1000 m2 de Cerezas
function biggestCherriesManagers() {
    return unionPaddockFarms.filter(paddockType => paddockType.paddockTypeName === 'CEREZAS' && paddockType.area > 1000 && paddockType.nameFarms === 'FORESTAL Y AGRICOLA LO ENCINA')
        .map((paddocks) => paddocks.name).sort((a, b) => a - b);
}

// 7 Objeto en el cual las claves sean el nombre del administrador y el valor un arreglo con los nombres de los campos que administra, ordenados alfabéticamente
function farmManagerPaddocks() {
    const paddockManagersById = paddockManagers.reduce((acc, val) => ({ ...acc, [val.id]: val }), {});

    const FarmsById = farms.reduce((acc, val) => ({ ...acc, [val.id]: val }), {});

    const paddockByManagerId = paddocks.reduce((acc, val) => {
        acc[paddockManagersById[val.paddockManagerId].name] = (acc[paddockManagersById[val.paddockManagerId].name] ?? []).concat([FarmsById[val.farmId].name]);
        return acc;
    }, {});

    return Object.keys(paddockByManagerId).reduce((acc, key) => {
        acc[key] = Array.from(new Set(paddockByManagerId[key])).sort();
        return acc;
    }, {});
}

// 8 Objeto en que las claves sean el tipo de cultivo concatenado con su año de plantación (la concatenación tiene un separador de guión ‘-’, por ejemplo AVELLANOS-2020) y el valor otro objeto en el cual la clave sea el id del administrador y el valor el nombre del administrador
function paddocksManagers() {
    const paddockTypesById = paddockType.reduce((acc, val) => ({ ...acc, [val.id]: val }), {});

    const paddockManagersById = paddockManagers.reduce((acc, val) => ({ ...acc, [val.id]: val }), {});

    return paddocks.reduce((acc, val) => {
        const key = `${paddockTypesById[val.paddockTypeId].name}-${val.harvestYear}`;
        acc[key] = {
            ...(acc[key] ?? {}),
            [val.paddockManagerId]: paddockManagersById[val.paddockManagerId].name
        };
        return acc;
    }, {});
}

// 9 Agregar nuevo administrador con datos ficticios a "paddockManagers" y 
// agregar un nuevo cuartel de tipo NOGALES con 900mts2, 
// año 2017 de AGRICOLA SANTA ANA,
// administrado por este nuevo administrador 
function newManagerRanking() {
    const newPaddockManager = { id: 7, taxNumber: "999999", name: "JANE DOE" };
    const newPaddockInfo = {
        paddockManagerId: 7,
        farmId: 1,
        paddockTypeId: 4,
        harvestYear: 2017,
        area: 900
    };

    const newPaddockManagers = [...paddockManagers, newPaddockManager];
    const newPaddocksInfo = [...paddocks, newPaddockInfo];

    const paddockManagersById = newPaddockManagers.reduce(
        (acc, val) => ({ ...acc, [val.id]: val }),
        {}
    );

    const areaByPaddockManagerId = newPaddocksInfo.reduce((acc, val) => {
        acc[val.paddockManagerId] = (acc[val.paddockManagerId] ?? 0) + val.area;
        return acc;
    }, {});

    const sortedByAreasManagers = Object.keys(areaByPaddockManagerId)
        .sort(
            (a_key, b_key) =>
                areaByPaddockManagerId[b_key] - areaByPaddockManagerId[a_key]
        )
        .map((managerId) => paddockManagersById[managerId].name);

    return sortedByAreasManagers.indexOf(newPaddockManager.name) + 1;
}


const tests = {
    0: {
        description: "Arreglo con los ids de los responsables de cada cuartel.",
        fn: listPaddockManagerIds
    },
    1: {
        description:"Arreglo con los ruts de los responsables de los cuarteles, ordenados por nombre.",
        fn: listPaddockManagersByName   
    },
    2: {
        description:
            "Arreglo con los nombres de cada tipo de cultivo, ordenados decrecientemente por la suma TOTAL de la cantidad de hectáreas plantadas de cada uno de ellos.",
        fn: sortPaddockTypeByTotalArea
    },
    3: {
        description:
            "Arreglo con los nombres de los administradores, ordenados decrecientemente por la suma TOTAL de hectáreas que administran.",
        fn: sortFarmManagerByAdminArea
    },
    4: {
        description:
            "Objeto en que las claves sean los nombres de los campos y los valores un arreglo con los ruts de sus administradores ordenados alfabéticamente por nombre.",
        fn: farmManagerNames
    },
    5: {
        description:"Arreglo ordenado decrecientemente con los m2 totales de cada campo que tengan más de 2 hectáreas en Paltos",
        fn: biggestAvocadoFarms
    },
    6: {
        description:"Arreglo con nombres de los administradores de la FORESTAL Y AGRÍCOLA LO ENCINA, ordenados por nombre, que trabajen más de 1000 m2 de Cerezas",
        fn: biggestCherriesManagers
    },
    7: {
        description:"Objeto en el cual las claves sean el nombre del administrador y el valor un arreglo con los nombres de los campos que administra, ordenados alfabéticamente",
        fn: farmManagerPaddocks
    },
    8: {
        description:"Objeto en que las claves sean el tipo de cultivo concatenado con su año de plantación (la concatenación tiene un separador de guión ‘-’, por ejemplo AVELLANOS-2020) y el valor otro objeto en el cual la clave sea el id del administrador y el valor el nombre del administrador",
        fn: paddocksManagers
    },
    9: {
        description:
            "Agregar nuevo administrador con datos ficticios a 'paddockManagers' y agregar un nuevo cuartel de tipo NOGALES con 900mts2, año 2017 de AGRICOLA SANTA ANA, administrado por este nuevo administrador. Luego devolver el lugar que ocupa este nuevo administrador en el ranking de la pregunta 3. No modificar arreglos originales para no alterar las respuestas anteriores al correr la solución",
        fn: newManagerRanking
    }
};

module.exports = tests;

