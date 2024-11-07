import {expect} from "chai"
import hre from "hardhat"
import {SignerWithAddress} from "@nomicfoundation/hardhat-ethers/signers"
import {TodoList} from "../typechain-types"

async function deployContract() {
    const contract = await hre.ethers.getContractFactory('TodoList')
    return contract.deploy()
}

describe("todo list", function () {
    let contract: TodoList
    let owner: SignerWithAddress
    let nonOwner: SignerWithAddress

    beforeEach(async () => {
        contract = await deployContract();
        [owner, nonOwner] = await hre.ethers.getSigners()
    })

    it('should get todo list contract', async function () {
        const contract = await hre.ethers.getContractFactory('TodoList')
        expect(contract).to.not.be.undefined
    })

    it("should not get tasks list as non-owner", async function () {
        await expect(contract.connect(nonOwner).getTasks())
            .to.be.revertedWithCustomError(contract, "OnlyOwner")
    })

    async function expectTask(expected: (string | number)[][]) {
        const {getTasks} = contract

        const tasks = await getTasks()

        tasks.forEach((t, i) => {
            expect(t[0]).to.equal(expected[i][0])
            expect(t[1]).to.equal(expected[i][1])
            expect(t[2]).to.be.a("bigint")
        })
    }

    describe("creation", function () {
        it("should not add a task if price is not 0.01 ether", async function () {
            await expect(contract.addTask("Buy milk", {value: hre.ethers.parseEther("0.009")}))
                .to.be.revertedWithCustomError(contract, "PriceMustBe0_01Ether")

            await expect(contract.addTask("Buy milk", {value: hre.ethers.parseEther("0.011")}))
                .to.be.revertedWithCustomError(contract, "PriceMustBe0_01Ether")
        })

        it("should add a task to the list by owner with 0.01 ether", async function () {
            await contract.addTask("Buy milk", {value: hre.ethers.parseEther("0.01")})
            await expectTask([["Buy milk", 0]])

            await contract.addTask("Buy clothes", {value: hre.ethers.parseEther("0.01")})
            await expectTask([["Buy milk", 0], ["Buy clothes", 0]])
        })

        it("should prevent non-owner from adding a task", async function () {
            await expect(contract.connect(nonOwner).addTask("Buy milk"))
                .to.be.revertedWithCustomError(contract, "OnlyOwner")
        })
    })

    describe("modification", () => {
        it("should modify an existing task by owner", async function () {
            await contract.addTask("Buy milk", {value: hre.ethers.parseEther("0.01")})
            await contract.modifyTask(0, "Buy eggs", 1)

            await expectTask([["Buy eggs", 1]])
        })

        it("should prevent from modifying a non-existing task", async function () {
            await expect(contract.modifyTask(0, "Buy eggs", 1))
                .to.be.revertedWithCustomError(contract, "TaskDoesNotExist")
        })

        it("should prevent non-owner from modifying a task", async function () {
            await contract.addTask("Buy milk", {value: hre.ethers.parseEther("0.01")})

            await expect(contract.connect(nonOwner).modifyTask(0, "Buy milk", 1))
                .to.be.revertedWithCustomError(contract, "OnlyOwner")
        })
    })

    describe("deletion", () => {
        it("should delete a task by owner", async () => {
            await contract.addTask("Buy milk", {value: hre.ethers.parseEther("0.01")})
            await contract.addTask("Buy eggs", {value: hre.ethers.parseEther("0.01")})

            await contract.deleteTask(0)

            await expectTask([["Buy eggs", 0]])
        })

        it("should prevent non-owner from deleting a task", async () => {
            await contract.addTask("Buy milk", {value: hre.ethers.parseEther("0.01")})

            await expect(contract.connect(nonOwner).deleteTask(0))
                .to.be.revertedWithCustomError(contract, "OnlyOwner")
        })

        it("should prevent from deleting a non-existing task", async () => {
            await expect(contract.deleteTask(0))
                .to.be.revertedWithCustomError(contract, "TaskDoesNotExist")
        })
        
        it('should refund the owner if a task is deleted', async () => {
            await contract.addTask("Buy milk", {value: hre.ethers.parseEther("0.01")})
            const initialBalance = await hre.ethers.provider.getBalance(owner.address)

            const tx = await contract.deleteTask(0)

            const receipt = await tx.wait()
            const gasUsed = receipt!.gasUsed
            const gasPrice = receipt!.gasPrice
            const refund = hre.ethers.parseEther("0.01")
            const finalBalance = await hre.ethers.provider.getBalance(owner.address)
            expect(finalBalance).to.be.equal(initialBalance - gasPrice * gasUsed + refund)
        })
    })
})
