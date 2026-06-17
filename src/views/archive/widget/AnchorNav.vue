<template>
    <div class="anchor-nav">
        <div class="anchor-content">
            <div class="anchor-list">
                <div v-for="(year, index) in years" :key="year"
                    class="anchor-item" :class="{ active: activeYear === year }"
                    @click="handleYearClick(year)">
                    <span class="anchor-bullet">{{ index + 1 }}</span>
                    <span class="anchor-text">{{ year }}年</span>
                </div>
            </div>
            <hr />
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    years: string[]
    activeYear: string
}>()

const emit = defineEmits<{
    (e: 'update:activeYear', value: string): void
}>()

const handleYearClick = (year: string) => {
    emit('update:activeYear', year)
    const element = document.getElementById(`year-${year}`)
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
}
</script>

<style lang="scss" scoped>
.anchor-nav {
    width: 180px;
    display: flex;
    flex-direction: column;
    height: 100%;
    transition: width 0.3s ease;

    &.collapsed {
        width: 40px;
    }
}


.anchor-content {
    flex-grow: 1;
    padding: 16px 8px;
}

.anchor-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.anchor-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: var(--hover-bg-color-100);
    }

    &.active {
        background: var(--bg-color-300);

        .anchor-text {
            color: var(--text-color-100);
        }
    }
}

.anchor-bullet {
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-color-400);
    background: var(--bg-color-100);
    border-radius: 4px;
    flex-shrink: 0;
}

.anchor-text {
    font-size: 13px;
    color: var(--text-color-300);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

@media screen and (max-width: 1024px) {
    .anchor-nav {
        display: none;
    }
}
</style>
